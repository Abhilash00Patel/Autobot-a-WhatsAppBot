const fs = require("fs");
const path = require("path");
const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// WhatsApp session path
const authPath = path.join(__dirname, ".wwebjs_auth");

// Initialize WhatsApp client
const chromePath = process.env.CHROME_PATH || "/usr/bin/chromium";
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-session" }),
  puppeteer: { headless: true, executablePath: chromePath },
});

// Ready event
client.on("ready", () => {
  console.log("✅ WhatsApp bot is ready!");
});

// Initialize client
client.initialize();

// Express server
app.listen(port, () => {
  console.log(`🌐 Web server running on http://localhost:${port}`);
});

// Error handling on disconnect
client.on("disconnected", (reason) => {
  console.error("❌ Client disconnected:", reason);
  setTimeout(() => {
    console.log("♻️ Reinitializing WhatsApp client...");
    client.initialize();
  }, 5000);
});

// Simplified message handler (optional)
client.on("message", (message) => {
  console.log("Received message:", message.body);
});