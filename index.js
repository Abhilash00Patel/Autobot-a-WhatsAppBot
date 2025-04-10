const fs = require("fs");
fs.writeFileSync("server-log.txt", `✅ Bot started on server at ${new Date().toLocaleString()}\n`);
const path = require("path");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const cron = require("node-cron");
const express = require("express");
const { handleReplies } = require("./replies/messages");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;


const authPath = path.join(__dirname, ".wwebjs_auth");
const lockFile = path.join(authPath, "session", "SingletonLock");

// ✅ Patch to remove lock file if it exists
if (fs.existsSync(lockFile)) {
  console.warn("⚠️ Found SingletonLock file. Deleting to prevent browser crash...");
  fs.unlinkSync(lockFile);
}
//nice
// Check for session folder
if (!fs.existsSync(authPath)) {
  console.warn("⚠️ Warning: .wwebjs_auth folder is missing! Login may not persist across restarts.");
} else {
  console.log("✅ Session data exists in .wwebjs_auth");
}

// Express setup
app.get("/", (req, res) => {
  res.send("AutoBot 2.0 is alive! 🚀");
});
app.listen(port, () => {
  console.log(`🌐 Web server running on http://localhost:${port}`);

  // Start client after server boot
  setTimeout(() => {
    try {
      console.log("🚀 Launching WhatsApp client...");
      client.initialize();
    } catch (err) {
      console.error("❌ Failed to initialize WhatsApp client:", err.message);
    }
  }, 3000);
});

// Puppeteer client setup
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

// QR handler
client.on("qr", (qr) => {
  console.log("📲 Scan the QR code below:");
  qrcode.generate(qr, { small: true });
});

// WhatsApp Ready
client.on("ready", async () => {
  console.log("✅ WhatsApp bot is ready to roll!");

  const targetGroupId = "917805064405-1614323596@g.us";

  // Notify group on restart
  try {
    await client.sendMessage(
      targetGroupId,
      `🔁 *AutoBot 2.0* ⚙️ restarted and is now active again! ~ Made by Arya`
    );
  } catch (err) {
    console.error("❌ Could not send restart notification:", err.message);
  }

  const names = ["Nabhi-tiwariji", "Aman-Deep", "Abhilash"];

  // 🔁 Weekly veggie duty (every Monday 5PM)
  cron.schedule("0 17 * * 1", async () => {
    if (!isClientReady()) {
      console.warn("⚠️ Client not ready, skipping veggie duty message.");
      return;
    }
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    const selectedPerson = names[weekNumber % names.length];

    const message = `🛒 This week's veggie shopper is: *${selectedPerson}* 🍅🥕 ~ *AutoBot 2.0* ⚙️ `;
    await client.sendMessage(targetGroupId, message).catch((err) => {
      console.error("❌ Failed to send duty message:", err.message);
    });
  });

  // 🔁 Scheduled test message every 5 min
  cron.schedule("*/5 * * * *", async () => {
    if (!isClientReady()) {
      console.warn("⚠️ Client not ready, skipping scheduled test.");
      return;
    }
    await client.sendMessage(targetGroupId, "⏰ Scheduled message test!").catch((err) => {
      console.error("❌ Scheduled test message failed:", err.message);
    });
  });
});

// Message handler
client.on("message", async (message) => {
  if (message.fromMe) return;
  await handleReplies(message);
});

// Detect disconnection and restart
client.on("disconnected", (reason) => {
  console.error("❌ Client disconnected:", reason);
  setTimeout(() => {
    console.log("♻️ Reinitializing WhatsApp client...");
    client.initialize();
  }, 5000);
});

// Safe shutdown
process.on("SIGINT", async () => {
  console.log("👋 Bot shutting down...");
  try {
    await client.destroy();
  } catch (err) {
    console.warn("⚠️ Error destroying client:", err.message);
  }
  process.exit(0);
});

// ✅ Utility to check client status
function isClientReady() {
  return client && client.info && client.info.wid;
}
