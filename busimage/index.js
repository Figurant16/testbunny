(function (c, p, y, d, u, r, w, b) {
    "use strict";
  
    // Références aux modules Discord
    const messagesModule = d.findByProps("sendMessage", "receiveMessage");
  
    // Fonction pour récupérer une image aléatoire depuis r/bus
    async function sendBusImage(channelId) {
      try {
        let response = await fetch("https://www.reddit.com/r/bus/top.json?limit=50");
        let data = await response.json();
        let posts = data.data.children.filter(post => post.data.post_hint === "image");
  
        if (posts.length === 0) {
          messagesModule.sendMessage(channelId, { content: "No bus images found. 🚌❌" });
          return;
        }
  
        let randomPost = posts[Math.floor(Math.random() * posts.length)];
        let imageUrl = randomPost.data.url;
  
        messagesModule.sendMessage(channelId, { content: imageUrl });
      } catch (error) {
        y.logger.log(error);
        messagesModule.sendMessage(channelId, { content: "An error occurred while fetching the bus image. 🚌❌" });
      }
    }
  
    // Liste des commandes
    let commands = [];
  
    commands.push(p.registerCommand({
      name: "bus",
      displayName: "bus",
      description: "Get a random image of a bus",
      execute: async function (_, context) {
        sendBusImage(context.channel.id);
      }
    }));
  
    // Initialisation et destruction du plugin
    function onLoad() {}
    function onUnload() {
      for (const unregister of commands) unregister();
    }
  
    c.onLoad = onLoad;
    c.onUnload = onUnload;
  
  })({}, vendetta.commands, vendetta, vendetta.metro, vendetta.ui.components, vendetta.plugin, vendetta.storage, vendetta.ui.assets);
  