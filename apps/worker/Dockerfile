FROM node:20-alpine

# Install Python and ffmpeg for yt-dlp, and Chromium for Puppeteer
RUN apk add --no-cache python3 ffmpeg chromium nss freetype harfbuzz ca-certificates ttf-freefont \
    && wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true" \
    PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

WORKDIR /app

# Force Node to prefer IPv4 (fixes Supabase ENETUNREACH)
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Copy root package.json
COPY package.json ./
RUN npm install

# Copy all source code
COPY . .

CMD ["npm", "run", "start:worker"]
