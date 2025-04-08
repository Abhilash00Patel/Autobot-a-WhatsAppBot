FROM node:18

# Install Chromium and required dependencies
RUN apt-get update && apt-get install -y \
    chromium-browser \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Puppeteer settings
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV CHROME_PATH="/usr/bin/chromium-browser"

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=10s \
    CMD curl -f http://localhost:3000/ || exit 1

EXPOSE 3000

CMD ["npm", "start"]
