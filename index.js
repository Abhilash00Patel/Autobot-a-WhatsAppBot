const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const cron = require("node-cron");
const express = require("express");
const { handleReplies } = require("./replies/messages");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const authPath = path.join(__dirname, ".wwebjs_auth");
const lockFile = path.join(authPath, "bot-session", "session", "SingletonLock"); // fixed for clientId

console.log(`✅ Bot started on server at ${new Date().toLocaleString()}`);

// Delete lock file if it exists
if (fs.existsSync(lockFile)) {
  console.warn("⚠️ Found SingletonLock file. Deleting...");
  fs.unlinkSync(lockFile);
}

// Session folder check
if (!fs.existsSync(authPath)) {
  console.warn("⚠️ .wwebjs_auth folder missing! Login may not persist.");
} else {
  console.log("✅ Session data exists in .wwebjs_auth");
}

// Express server
app.get("/", (req, res) => {
  res.send("AutoBot 2.0 is alive! 🚀");
});
app.listen(port, () => {
  console.log(`🌐 Web server running on http://localhost:${port}`);

  setTimeout(() => {
    try {
      console.log("🚀 Launching WhatsApp client...");
      client.initialize();
    } catch (err) {
      console.error("❌ Failed to initialize WhatsApp client:", err.message);
    }
  }, 3000);
});

// Puppeteer + Client setup
const chromePath = process.env.CHROME_PATH || "/usr/bin/chromium";
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-session" }),
  puppeteer: {
    headless: true,
    executablePath: chromePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--single-process", "--no-zygote"],
  },
});

// Group ID (replace with actual group ID)
const targetGroupId = "917805064405-1614323596@g.us";
const names = ["Nabhi-tiwariji", "Aman-Deep", "Abhilash"];

// QR code login
client.on("qr", (qr) => {
  console.log("📲 Scan the QR code below:");
  qrcode.generate(qr, { small: true });
});

// On ready
client.on("ready", async () => {
  console.log("✅ WhatsApp bot is ready!");

  try {
    await client.sendMessage(
      targetGroupId,
      "🔁 *AutoBot 2.0* ⚙️ restarted and is now active again! ~ Made by Arya"
    );
    console.log("✅ Restart message sent to group.");
  } catch (err) {
    console.error("❌ Could not send restart notification:", err.message);
  }

  // Weekly veggie duty (Monday 5PM)
  cron.schedule("0 17 * * 1", async () => {
    if (!isClientReady()) return;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    const selectedPerson = names[weekNumber % names.length];

    const message = `🛒 This week's veggie shopper is: *${selectedPerson}* 🍅🥕 ~ *AutoBot 2.0* ⚙️`;
    try {
      await client.sendMessage(targetGroupId, message);
    } catch (err) {
      console.error("❌ Failed to send duty message:", err.message);
    }
  });

  // Every 5 mins ping
  cron.schedule("*/5 * * * *", async () => {
    if (!isClientReady()) return;
    try {
      await client.sendMessage(targetGroupId, "⏰ Scheduled message test!");
    } catch (err) {
      console.error("❌ Scheduled test message failed:", err.message);
    }
  });
});

// Message handling
client.on("message", async (message) => {
  if (message.fromMe) return;
  if (message.from !== targetGroupId) return;
  await handleReplies(message);
});

// Disconnection recovery
client.on("disconnected", (reason) => {
  console.error("❌ Client disconnected:", reason);
  setTimeout(() => {
    console.log("♻️ Reinitializing WhatsApp client...");
    client.initialize();
  }, 5000);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("👋 Bot shutting down...");
  try {
    await client.destroy();
  } catch (err) {
    console.warn("⚠️ Error destroying client:", err.message);
  }
  process.exit(0);
});

// Utility: check if client ready
function isClientReady() {
  return client && client.info && client.info.wid;
}
