require("dotenv").config();         // <— make sure this is at the very top
const fs = require("fs");
const path = require("path");
const qrcodeTerminal = require("qrcode-terminal");
const QR = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");
const cron = require("node-cron");
const express = require("express");
const { handleReplies } = require("./replies/messages");

const app = express();
const port = process.env.PORT || 3000;

// --- Express routes ---
app.get("/health", (req, res) => res.status(200).send("OK"));
app.get("/", (req, res) => res.send("AutoBot 2.0 is alive! 🚀"));

// --- Serve QR PNG endpoint -
let lastQr = null, lastTime = 0;
const QR_THROTTLE_MS = 60_000;
app.get("/qr.png", async (req, res) => {
  if (!lastQr) return res.status(404).send("QR not yet generated");
  try {
    const buffer = await QR.toBuffer(lastQr, { type: "png", margin: 2, scale: 6 });
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (e) {
    console.error("❌ Error generating QR PNG:", e);
    res.status(500).send("Failed to generate QR");
  }
});

// --- Read secrets from env ---
const targetGroupId = process.env.TARGET_GROUP_ID;
if (!targetGroupId) {
  console.error("🚨 ERROR: TARGET_GROUP_ID is not set in your environment!");
  process.exit(1);
}

// --- WhatsApp client setup ---
console.log("Setting up WhatsApp client options...");
const chromePath = process.env.CHROME_PATH || "/usr/bin/chromium";
console.log(`Using CHROME_PATH: ${chromePath}`);

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-session" }),
  puppeteer: {
    headless: true,
    executablePath: chromePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  },
});
let httpServer;

console.log("WhatsApp client object created.");

// --- QR code handler with throttle ---
client.on("qr", (qr) => {
  const now = Date.now();
  if (now - lastTime < QR_THROTTLE_MS) {
    console.log(`⚠️ Throttled QR; reuse until ${new Date(lastTime + QR_THROTTLE_MS).toLocaleTimeString()}`);
    return;
  }
  lastTime = now;
  lastQr = qr;
  console.log("📲 RAW QR STRING:", qr);
  console.log("📲 ASCII QR:");
  qrcodeTerminal.generate(qr, { small: true });
});

// --- Event handlers ---
client.on("authenticated", () => console.log("🔐 Authenticated!"));
client.on("auth_failure", (msg) => console.error("❌ AUTH_FAILURE EVENT:", msg));
client.on("error", (err) => console.error("❌ CLIENT ERROR EVENT:", err));
client.on("disconnected", (reason) => {
  console.error("❌ Client disconnected, reinitializing:", reason);
  client.initialize();
});

client.on("ready", async () => {
  console.log("✅ WhatsApp bot is ready!");
  try {
    await client.sendMessage(
      targetGroupId,
      "🔁 *AutoBot 2.0* ⚙️ restarted and is now active again! ~ Made by Arya"
    );
    console.log("✅ Restart message sent to group.");
  } catch (err) {
    console.error("❌ Could not send restart notification:", err);
  }
  setupCronJobs();
});

client.on("message", async (message) => {
  if (message.from === targetGroupId) {
    console.log(`Received message from target group: ${message.body.substring(0, 20)}...`);
    await handleReplies(message);
  }
});

// --- Cron job setup ---
function setupCronJobs() {
  console.log("Setting up cron jobs...");
  const names = ["Nabhi-tiwariji", "Aman-Deep", "Abhilash"];
  cron.schedule("30 11 * * 1", async () => {
    console.log("⏰ Cron job triggered for weekly duty.");
    if (!client.info?.wid) return;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    const selectedPerson = names[weekNumber % names.length];
    try {
      await client.sendMessage(
        targetGroupId,
        `🛒 This week's veggie shopper is: *${selectedPerson}* 🍅🥕 ~ *AutoBot 2.0* ⚙️`
      );
      console.log(`✅ Veggie duty message sent: ${selectedPerson}`);
    } catch (err) {
      console.error("❌ Failed to send veggie duty message:", err);
    }
  });
  console.log("✅ Cron jobs set up.");
}

// --- Graceful shutdown ---
async function shutdown() {
  console.log("👋 Initiating graceful shutdown...");
  if (httpServer) {
    console.log("🔵 Closing web server...");
    httpServer.close((err) =>
      err ? console.error("⚠️ Error closing web server:", err) : console.log("✅ Web server closed.")
    );
  }
  if (client && typeof client.destroy === "function") {
    try {
      console.log("🔵 Destroying WhatsApp client...");
      await client.destroy();
      console.log("✅ WhatsApp client destroyed.");
    } catch (err) {
      console.error("⚠️ Error destroying WhatsApp client:", err);
    }
  }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// --- Start HTTP server & then initialize client ---
httpServer = app.listen(port, () => {
  console.log(`🌐 Web server running on http://localhost:${port}`);
  setTimeout(async () => {
    console.log("🚀 Launching WhatsApp client...");
    try {
      await client.initialize();
      console.log("✅ client.initialize() completed.");
    } catch (err) {
      console.error("❌ ERROR during client.initialize():", err);
    }
  }, 3000);
});

