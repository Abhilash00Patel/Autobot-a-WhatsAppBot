const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const cron = require("node-cron");
const express = require("express");
const { handleReplies } = require("./replies/messages");
require("dotenv").config();

// 🧹 Auto-delete Puppeteer SingletonLock file
const lockPath = path.join(__dirname, ".wwebjs_auth", "session", "SingletonLock");
if (fs.existsSync(lockPath)) {
  try {
    fs.unlinkSync(lockPath);
    console.log("🧹 Removed stale SingletonLock file.");
  } catch (err) {
    console.error("⚠️ Failed to remove SingletonLock:", err.message);
  }
}

const chromePath = process.env.CHROME_PATH || "/usr/bin/chromium";

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: chromePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--single-process",
      "--no-zygote",
    ],
  },
});

client.on("qr", (qr) => {
  console.log("📲 Scan the QR code below:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp bot is ready to roll!");

  const targetGroupId = "917805064405-1614323596@g.us";

  // 🔁 Weekly veggie duty message
  const names = ["Nabhi-tiwariji", "Aman-Deep", "Abhilash"];
  cron.schedule("0 17 * * 1", async () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    const selectedPerson = names[weekNumber % names.length];

    const message = `🛒 This week's veggie shopper is: *${selectedPerson}* 🍅🥕 ~ *AutoBot 2.0* ⚙️ `;
    try {
      await client.sendMessage(targetGroupId, message);
      console.log("✅ Weekly veggie duty sent!");
    } catch (err) {
      console.error("❌ Failed to send duty message:", err.message);
    }
  });

  // ⏱ Test every 5 mins
  cron.schedule("*/5 * * * *", async () => {
    await client.sendMessage(targetGroupId, "⏰ Scheduled message test!");
  });

  // Bot live notification
  client.sendMessage(
    targetGroupId,
    `Hi I'm *AutoBot 2.0* ⚙️  - *Made By Arya*     Now with added features`
  );
});

client.on("message", async (message) => {
  if (message.fromMe) return;
  await handleReplies(message);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("👋 Bot shutting down...");
  await client.destroy();
  process.exit(0);
});

console.log("⏳ Waiting 3 seconds before launching WhatsApp client...");
setTimeout(() => {
  client.initialize();
}, 3000);

// ✅ Express server for Azure
const app = express();
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("AutoBot 2.0 is alive! 🚀");
});
app.listen(port, () => {
  console.log(`🌐 Web server running on http://localhost:${port}`);
});
