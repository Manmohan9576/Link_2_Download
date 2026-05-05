#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh <DROPLET_IP_ADDRESS>"
  exit 1
fi

DROPLET_IP=$1
USER="root" # DigitalOcean default user is usually root

echo "Deploying yt-audio-downloader to DigitalOcean Droplet at $DROPLET_IP..."

echo "1. Checking/Installing Docker on Droplet..."
ssh -o StrictHostKeyChecking=no $USER@$DROPLET_IP << 'EOF'
  if ! command -v docker &> /dev/null; then
    echo "Waiting for background apt processes to finish..."
    while fuser /var/lib/apt/lists/lock >/dev/null 2>&1 || fuser /var/lib/dpkg/lock >/dev/null 2>&1; do
      echo -n "."
      sleep 5
    done
    echo " Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    apt-get update
    apt-get install -y docker-compose-plugin
  else
    echo "Docker is already installed."
  fi
EOF

echo "2. Copying project files to Droplet..."
# Navigate to the root of the project to run rsync
cd ../../
rsync -avz -e "ssh -o StrictHostKeyChecking=no" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'downloads' \
  ./ $USER@$DROPLET_IP:~/yt-audio-downloader/

echo "3. Starting services on Droplet..."
ssh -o StrictHostKeyChecking=no $USER@$DROPLET_IP << 'EOF'
  cd ~/yt-audio-downloader
  
  # Ensure downloads directory exists for shared volume
  mkdir -p downloads
  chmod 777 downloads

  cd infra/digitalocean
  
  # Set the production credentials
  cp ../../.env.prod ../../.env
  
  # Start API, Worker, and Nginx (No Postgres/Redis, it will use Supabase/Upstash)
  docker compose -f docker-compose.prod.yml up -d --build
  
  # Restart Nginx to clear its internal DNS cache (prevents 502 Bad Gateway)
  docker compose -f docker-compose.prod.yml restart nginx
EOF

echo "✅ Deployment complete!"
echo "Access your app at: http://$DROPLET_IP"
