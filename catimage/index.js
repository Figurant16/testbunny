(function (c, p, y, d, u, r, w, b) {
    "use strict";
  
    // Références aux modules Discord
    const messagesModule = d.findByProps("sendMessage", "receiveMessage");
  
    // Fonction pour envoyer une image de chat
    async function sendCatImage(channelId) {
      try {
        let response = await fetch("https://api.thecatapi.com/v1/images/search");
        let data = await response.json();
        let imageUrl = data[0]?.url;
        
        if (!imageUrl) {
          messagesModule.sendMessage(channelId, { content: "Could not fetch a cat image. 😿" });
          return;
        }
        
        messagesModule.sendMessage(channelId, { content: imageUrl });
      } catch (error) {
        y.logger.log(error);
        messagesModule.sendMessage(channelId, { content: "An error occurred while fetching the cat image. 😿" });
      }
    }
  
    // Liste des commandes
    let commands = [];
  
    commands.push(p.registerCommand({
      name: "cat",
      displayName: "cat",
      description: "Get an image of a cat",
      execute: async function (_, context) {
        sendCatImage(context.channel.id);
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
  