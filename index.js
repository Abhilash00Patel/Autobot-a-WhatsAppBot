require("dotenv").config();
const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 3000;

const appOwnerNumber = "917805064405@c.us"; // 🔁 Your full WhatsApp ID here (like: 91XXXXXXXXXX@c.us)

app.get("/", (req, res) => {
  res.send("🚀 WhatsApp Bot is running!");
});
app.listen(PORT, () => {
  console.log(`🌐 Web server running on http://localhost:${PORT}`);
});

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    executablePath: process.env.CHROME_PATH || "/usr/bin/chromium",
  },
});

client.on("qr", (qr) => {
  console.log("📱 Scan this QR code to log in:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("✅ WhatsApp bot is ready to roll!");

  try {
    await client.sendMessage(appOwnerNumber, "🔁 AutoBot 2.0 restarted and is now active!");
    console.log("📩 Restart message sent to owner.");
  } catch (err) {
    console.error("⚠️ Failed to send restart message:", err);
  }
});

client.on("message", async (msg) => {
  if (msg.body.toLowerCase() === "hi") {
    msg.reply("AutoBot 2.0 ⚙️ is alive.");
  }
});

(async () => {
  try {
    console.log("🚀 Launching WhatsApp client...");
    await client.initialize();
  } catch (err) {
    console.error("❌ Failed to initialize WhatsApp client:", err);
  }
})();
