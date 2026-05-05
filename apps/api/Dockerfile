FROM node:20-alpine

# Install Chromium for Puppeteer, along with Python/yt-dlp for metadata fetching
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont python3 ffmpeg \
    && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true" \
    PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

WORKDIR /app

# Force Node to prefer IPv4 (fixes Supabase ENETUNREACH)
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Copy root monorepo package.json
COPY package.json ./
RUN npm install

# Copy all source code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:api"]
