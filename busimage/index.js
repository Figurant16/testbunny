(function (c, p, y, d, u, r, w, b) {
    "use strict";

    // Références aux modules Discord
    const messagesModule = d.findByProps("sendMessage", "receiveMessage");

    // Informations d'identification Reddit
    const clientId = 'YOUR_CLIENT_ID';
    const clientSecret = 'YOUR_CLIENT_SECRET';
    const userAgent = 'YOUR_USER_AGENT';

    // Fonction pour obtenir un token d'accès Reddit
    async function getRedditAccessToken() {
      const response = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: 'grant_type=client_credentials',
      });

      const data = await response.json();
      return data.access_token;
    }

    // Fonction pour envoyer une image de bus
    async function sendBusImage(channelId) {
      try {
        const accessToken = await getRedditAccessToken();
        const response = await fetch('https://www.reddit.com/r/buses/hot.json?limit=10', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': userAgent,
          },
        });

        const data = await response.json();
        const posts = data.data.children;
        const imagePost = posts.find(post => post.data.url.endsWith('.jpg') || post.data.url.endsWith('.png'));

        if (!imagePost) {
          messagesModule.sendMessage(channelId, { content: "Could not fetch a bus image. 🚌" });
          return;
        }

        messagesModule.sendMessage(channelId, { content: imagePost.data.url });
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
