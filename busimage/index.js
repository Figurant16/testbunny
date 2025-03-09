(function (c, p, y, d, u, r, w, b) {
    "use strict";

    // Références aux modules Discord
    const messagesModule = d.findByProps("sendMessage", "receiveMessage");

    // Fonction pour récupérer une image de bus depuis Reddit
    async function sendBusImage(channelId) {
        try {
            const subreddit = "busporn"; // Subreddit contenant des images de bus
            const response = await fetch(`https://www.reddit.com/r/${subreddit}/random.json`);
            const data = await response.json();

            // Vérification et extraction de l'image
            const post = data[0]?.data?.children[0]?.data;
            const imageUrl = post?.url_overridden_by_dest;

            if (!imageUrl || !imageUrl.endsWith(".jpg") && !imageUrl.endsWith(".png")) {
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
