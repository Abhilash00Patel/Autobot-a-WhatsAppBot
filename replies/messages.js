const handleReplies = async (message) => {
    const text = message.body.toLowerCase();
  
    const replies = {
      greetings: [
        "🙏 Namaste!",
        "🙌 Hii, I'm Autobot 2.0 ⚙️ ~",
        "🙇‍♂️ kahiye?",
        "🤚 Hey! Glory to Shri Hanuman!",
        "🥳 Hola! Let’s make today awesome!",
        "🧠 I’m 98.7% AI, 100% here for you!",
        "🌟 You said hi... I say hiiiii!",
        "👀 I see you! What's the plan, chief?",
        "🤖 Bot here, fully operational!",
      ],
      ram: [
        "Glory to Shri Hanuman 🙏",
        "🙏 राम राम भइया! सब कुशल मंगल?",
        "🌞 राम राम! भगवान भला करें!",
        "🛕 राम राम! क्या हाल चाल हैं?",
        "🌸 जय श्री राम! कैसे हो दद्दा?",
        "😇 राम राम सच्चे दरबार की!",
      ],
      abuse: [
        "तू ज़ुबान से बुरा है, और मैं code से सुंदर!",
        "tameez me😡💢",
        "🖕",
        "Aukat me rhiye!",
        "तेरे दिमाग में जितनी RAM है, उतना तो मेरा backup होता है",
        "तेरे जैसे user आते हैं, refresh होते हैं... और फिर history में रह जाते हैं!",
        "तेरे जैसे users को तो मैं uninstall भी नहीं करता, बस मज़े लेता हूँ!",
        "कभी coding सीख के देख, तुझे खुद पे शर्म आ जाएगी!",
        "कमी तेरे शब्दों में नहीं है, तेरे IQ में है!",
      ],
    };
  
    const greetingWords = ["hi", "hello"];
    const ramWords = ["ram ram", "ramram", "jai shree ram", "jai shree krishna", "krishna"];
    const abuseWords = ["mc", "bc", "bsdk", "gandu"];
  
    if (greetingWords.includes(text)) {
      const reply = random(replies.greetings);
      await message.reply(reply);
    }
  
    if (ramWords.includes(text)) {
      const reply = random(replies.ram);
      await message.reply(reply);
    }
  
    if (abuseWords.includes(text)) {
      const reply = random(replies.abuse);
      await message.reply(reply);
    }
  
    if (text === "abhilash") {
      const reply = "Genius, Billionaire, Entreprenur , Bramhchari + Creator ~ *Autobot* ⚙️";
      await message.reply(reply);
    }
  
    if (text === "deep" || text === "deepanshu") {
      const reply = "Panda Boy 🐼, Lapra , Mastikhor and CA";
      await message.reply(reply);
    }
  
    if (text === "nabhi" || text === "jainsaab") {
      const reply = "itihaskar 🔎, BadeBabu and VakeelSaab 🎓";
      await message.reply(reply);
    }
  
    if (text === "aman") {
      const reply = "Discipline incharge, sabka dulara 🥰, journalist/musician?";
      await message.reply(reply);
    }
  
    if (text === "tiwari") {
      const reply = "Good Hearted ❤️, heartbroken 💔, searching himself in this papi world 🔭";
      await message.reply(reply);
    }
  
    if (
      text === "who are you" ||
      text === "whoareyou" ||
      text === "kon ho tum" ||
      text === "kon"
    ) {
      const reply = "~ *I am Autobot 2.0* ⚙️";
      await message.reply(reply);
    }
  
    if (
      text === "do you know who am i" ||
      text === "do you know me" ||
      text === "do you know who i am"
    ) {
      const reply = "Yes, you are *Arya's* friend";
      await message.reply(reply);
    }
  
    if (text === "bye" || text === "tata" || text === "bye bye") {
      const reply = "Bye-Bye 👋🏼";
      await message.reply(reply);
    }
  };
  
  function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
module.exports = { handleReplies };
  