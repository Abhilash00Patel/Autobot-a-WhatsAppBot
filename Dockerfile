FROM node:18

# Install Chromium and dependencies
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
    libgbm-dev \
    libxshmfence-dev \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set environment variable for puppeteer to locate chromium
ENV CHROME_PATH=/usr/bin/chromium-browser

# Working directory
WORKDIR /app

# Copy files and install deps
COPY package*.json ./
RUN npm install
COPY . .

# Expose the port your app will run on
EXPOSE 3000

# Start command
CMD ["npm", "start"]
