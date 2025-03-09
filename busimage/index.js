(function (c, p, y, d, u, r, w, b) {
    "use strict";
  
    // Références aux modules Discord
    const messagesModule = d.findByProps("sendMessage", "receiveMessage");
  
    // Fonction pour envoyer une image de bus
    async function sendBusImage(channelId) {
      try {
        // Utilisation de l'API Unsplash pour récupérer des images de bus
        let response = await fetch("https://api.unsplash.com/photos/random?query=bus&client_id=XXFhl-4YFzsw3R4qEWVYGPGmmk0HulfSJt8F_dvKcVw");
        let data = await response.json();
        let imageUrl = data?.urls?.regular;
        
        if (!imageUrl) {
          messagesModule.sendMessage(channelId, { content: "Impossible de récupérer une image de bus. 🚌❌" });
          return;
        }
        
        messagesModule.sendMessage(channelId, { content: imageUrl });
      } catch (error) {
        y.logger.log(error);
        messagesModule.sendMessage(channelId, { content: "Une erreur s'est produite lors de la récupération de l'image de bus. 🚌❌" });
      }
    }
  
    // Liste des commandes
    let commands = [];
  
    // Nouvelle commande pour les bus
    commands.push(p.registerCommand({
      name: "bus",
      displayName: "bus",
      description: "Obtenir une image d'un bus",
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
