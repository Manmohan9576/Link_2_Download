YouTube Audio Downloader 🚀
A high-performance, scalable microservices-based application that converts YouTube videos to MP3 files and stores them securely on Amazon S3.

🌟 Features
Microservices Architecture: Separate containers for API and Background Worker.

Asynchronous Processing: Uses BullMQ and Redis to handle multiple download requests without slowing down the API.

Cloud Storage: Automatically uploads converted files to Amazon S3 (Stockholm region - eu-north-1).

Database Persistence: Stores job history and status in PostgreSQL.

Dockerized: Entire setup can be launched with a single command using Docker Compose.

🏗️ Architecture
API (Fastify): Receives the YouTube URL and adds it to the Redis queue.

Redis: Acts as a message broker between the API and the Worker.

Worker: Picks up jobs, uses yt-dlp to download/convert audio, and uploads it to S3.

PostgreSQL: Maintains the state of each job (Queued, Processing, Done, Failed).

Amazon S3: Final destination for the MP3 files.

🛠️ Tech Stack
Backend: Node.js (Fastify)

Queue Management: BullMQ & Redis

Database: PostgreSQL

Tools: yt-dlp, FFmpeg

Cloud: Amazon Web Services (S3)

Containerization: Docker & Docker Compose

🚀 Features

⚡ Redis Cache (Instant Load)

If a URL is processed for the first time, it may take some time.
However, if the same URL is requested again within the next 24 hours, the result will be returned almost instantly (~0.05 seconds) using Redis caching.

⸻

🔁 Proxy Timeout Handling

If a proxy becomes unresponsive or dead, the system will automatically discard it after 15 seconds and switch to the next available proxy.
This prevents the application from hanging and ensures smoother processing.

⸻

🌐 IPv6 Bypass (--force-ipv4)

The application forces yt-dlp to use IPv4 instead of IPv6 to ensure stable and reliable connections with YouTube, avoiding potential network issues and connection drops.

🚀 Installation & Setup
Follow these steps to get the project running on any system (Windows, Mac, or Linux).

1. Prerequisites
Docker & Docker Compose: Install here

AWS Account: You need an S3 bucket and IAM user keys.

2. Clone the Repository
Bash
git clone https://github.com/your-username/yt-audio-downloader.git
cd yt-audio-downloader
3. Setup Environment Variables
Create a .env file in the root folder and add your credentials:

Code snippet
# Database & Redis (Docker internal names)
DB_HOST=postgres
REDIS_HOST=redis

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-north-1
AWS_BUCKET_NAME=manmohan-yt-audio
4. Docker Deployment   
Run the following command to build and start all services:

Bash
docker compose up --build
5. Initialize Database Table
In a new terminal window, run this command to create the necessary table in your Docker database:

Bash
docker exec -it ytaudio-db psql -U user -d ytaudio -c "CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    video_url TEXT NOT NULL,
    status TEXT NOT NULL,
    file_key TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"
🖥️ Usage
Open your browser and go to http://localhost:3000.

Enter a YouTube Video URL.

The system will queue the job. You can monitor the progress in the terminal logs:

Bash
docker compose logs -f worker
Once completed, the file will be available in your Amazon S3 Bucket.

🔒 Security Note
Never commit your .env file to GitHub.


👤 Author
Manmohan Kumar Singh
Third-year B.Tech Computer Science Student

Key Points for Installation on Any System:
Mac/Linux: Commands will work exactly as shown.

Windows: Use PowerShell or Git Bash. Ensure Docker Desktop is running.

Production: For deploying to AWS EC2 or DigitalOcean, simply clone and run docker compose up -d.



