# Dockerfile

FROM node:20-alpine

# 1) Install headless Chromium and minimal runtime deps
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# 2) Tell Puppeteer to skip its own Chromium download
ENV PUPPETEER_SKIP_DOWNLOAD=true
# 3) Point at the system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

WORKDIR /app

# 4) Copy package manifests and install deps (no dev)
COPY package*.json ./
RUN npm ci --omit=dev

# 5) Copy application code
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
