const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const cron = require("node-cron");
const express = require("express");
const { handleReplies } = require("./replies/messages");
require("dotenv").config();

const app = express();
const port = process.env.WEBSITES_PORT || 3000;

const authPath = path.join(__dirname, ".wwebjs_auth");
const lockFile = path.join(authPath, "session", "SingletonLock");

// ✅ Patch to remove lock file if it exists (avoids crash)
// Only delete the SingletonLock file if it exists and is necessary to avoid crash
if (fs.existsSync(lockFile)) {
  console.warn("⚠️ Found SingletonLock file. Deleting to prevent browser crash...");
  fs.unlinkSync(lockFile);
}

// Check if the session data exists in the authPath directory
if (!fs.existsSync(authPath)) {
  console.warn("⚠️ Warning: .wwebjs_auth folder is missing! Login may not persist across restarts.");
} else {
  console.log("✅ Session data exists in .wwebjs_auth");
}

// Express server
app.get("/", (req, res) => {
  res.send("AutoBot 2.0 is alive! 🚀");
});
app.listen(port, () => {
  console.log(`🌐 Web server running on http://localhost:${port}`);

  // ✅ Start WhatsApp client after Express is fully running
  setTimeout(() => {
    try {
      console.log("🚀 Launching WhatsApp client...");
      client.initialize();
    } catch (err) {
      console.error("❌ Failed to initialize WhatsApp client:", err.message);
    }
  }, 3000);
});

// Puppeteer + Client Setup
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

client.on("ready", async () => {
  console.log("✅ WhatsApp bot is ready to roll!");

  const targetGroupId = "917805064405-1614323596@g.us";

  // 🚨 Notify group on restart
  try {
    await client.sendMessage(
      targetGroupId,
      `🔁 *AutoBot 2.0* ⚙️ restarted and is now active again! ~ Made by Arya`
    );
  } catch (err) {
    console.error("❌ Could not send restart notification:", err.message);
  }

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

  // Test message every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      await client.sendMessage(targetGroupId, "⏰ Scheduled message test!");
    } catch (err) {
      console.error("❌ Scheduled test message failed:", err.message);
    }
  });
});

// Handle messages
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
