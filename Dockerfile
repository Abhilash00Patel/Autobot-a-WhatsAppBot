FROM --platform=linux/amd64 node:16

# Install Chromium dependencies and clean up after installation
RUN apt-get update --fix-missing && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
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
    libgbm-dev \
    libxshmfence-dev \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set environment variable for Puppeteer to locate Chromium
ENV CHROME_PATH=/usr/bin/chromium

# Optionally set the PORT to 3000 for consistency—
# (Azure will override process.env.PORT if needed, and your code uses process.env.PORT || 3000)
ENV PORT=3000

# Set the working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app will run on
EXPOSE 3000

# Start your app – using explicit relative path for safety
CMD ["node", "./index.js"]
