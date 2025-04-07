FROM node:18

# Install Chromium manually (supports ARM64)
RUN apt-get update && apt-get install -y \
    chromium \
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

# Set env to skip Chromium download
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
ENV CHROME_PATH="/usr/bin/chromium"
RUN npm install

# Copy rest of your code
COPY . .

# Let Puppeteer know where Chromium is
ENV CHROME_PATH=/usr/bin/chromium

# 🔥 Tell Docker which port your app uses
EXPOSE 3000

# Run your bot
CMD ["node", "index.js"]
