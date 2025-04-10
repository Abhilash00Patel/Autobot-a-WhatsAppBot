client.on("ready", async () => {
  console.log("✅ WhatsApp bot is ready to roll!");

  const chats = await client.getChats();
  const group = chats.find(c => c.id._serialized === targetGroupId);

  if (!group) {
    console.error("❌ Could not find group with ID:", targetGroupId);
    return;
  }

  try {
    await client.sendMessage(
      targetGroupId,
      `🔁 *AutoBot 2.0* ⚙️ restarted and is now active again! ~ Made by Arya`
    );
  } catch (err) {
    console.error("❌ Could not send restart notification:", err.message);
  }

  const names = ["Nabhi-tiwariji", "Aman-Deep", "Abhilash"];

  // Weekly cron
  cron.schedule("0 17 * * 1", async () => {
    if (!isClientReady()) return;

    const now = new Date();
    const weekNumber = Math.floor(
      (now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)
    );
    const selectedPerson = names[weekNumber % names.length];

    const message = `🛒 This week's veggie shopper is: *${selectedPerson}* 🍅🥕 ~ *AutoBot 2.0* ⚙️ `;
    await client.sendMessage(targetGroupId, message).catch(err => {
      console.error("❌ Failed to send veggie duty message:", err.message);
    });
  });

  // 5-min test
  cron.schedule("*/5 * * * *", async () => {
    if (!isClientReady()) return;

    await client.sendMessage(targetGroupId, "⏰ Scheduled message test!").catch(err => {
      console.error("❌ Scheduled test message failed:", err.message);
    });
  });
});
