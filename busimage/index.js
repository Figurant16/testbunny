(function (c, p, y, d, u, r, w, b) {
    "use strict";
  
    // Références aux modules Discord
    const messagesModule = d.findByProps("sendMessage", "receiveMessage");
  
    // Fonction pour envoyer une image aléatoire de bus
    async function sendBusImage(channelId) {
      try {
        let response = await fetch("https://source.unsplash.com/featured/?bus");
        let imageUrl = response.url;
        
        if (!imageUrl) {
          messagesModule.sendMessage(channelId, { content: "Could not fetch a bus image. 🚌" });
          return;
        }
        
        messagesModule.sendMessage(channelId, { content: imageUrl });
      } catch (error) {
        y.logger.log(error);
        messagesModule.sendMessage(channelId, { content: "An error occurred while fetching the bus image. 🚌" });
      }
    }
  
    // Liste des commandes
    let commands = [];
  
    commands.push(p.registerCommand({
      name: "bus",
      displayName: "bus",
      description: "Get an image of a bus",
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
  