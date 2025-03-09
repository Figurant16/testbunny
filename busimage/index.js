(function(c, p, y, d, u, r, w, b) {
    "use strict";

    // Import necessary UI components
    const { ScrollView } = u.General;
    const { FormSection, FormRadioRow, FormSwitchRow, FormIcon } = u.Forms;

    function PluginSettings() {
        w.useProxy(r.storage);

        return React.createElement(ScrollView, null,
            React.createElement(FormSection, { title: "Misc Settings", titleStyleType: "no_border" }),
            React.createElement(FormSwitchRow, {
                label: "NSFW Warning",
                subLabel: "Warn when sending an NSFW image in a non NSFW channel.",
                leading: React.createElement(FormIcon, { source: b.getAssetIDByName("ic_warning_24px") }),
                value: r.storage.nsfwwarn,
                onValueChange: (value) => r.storage.nsfwwarn = value
            }),
            React.createElement(FormSection, { title: "Default Sort", titleStyleType: "no_border" },
                Object.entries({ Best: "best", Hot: "hot", New: "new", Rising: "rising", Top: "top", Controversial: "controversial" }).map(([label, value]) =>
                    React.createElement(FormRadioRow, {
                        label,
                        selected: r.storage.sortdefs === value,
                        onPress: () => r.storage.sortdefs = value
                    })
                )
            )
        );
    }

    // Utility functions and API references
    const messaging = d.findByProps("sendMessage", "receiveMessage");
    const channelUtils = d.findByProps("getLastSelectedChannelId");
    const messageCreator = d.findByProps("createBotMessage");
    const botAvatars = d.findByProps("BOT_AVATARS");

    function sendBotMessage(channelId, content, embeds = []) {
        const actualChannelId = channelId ?? channelUtils?.getChannelId?.();
        const botMessage = messageCreator.createBotMessage({ channelId: actualChannelId, content: "", embeds });
        
        botMessage.author.username = "Astolfo";
        botMessage.author.avatar = "Astolfo";
        botAvatars.BOT_AVATARS.Astolfo = "https://i.pinimg.com/736x/50/77/1f/50771f45b1c015cfbb8b0853ba7b8521.jpg";
        
        if (typeof content === "string") {
            botMessage.content = content;
        } else {
            Object.assign(botMessage, content);
        }
        
        messaging.receiveMessage(actualChannelId, botMessage);
    }

    let commands = [];

    commands.push(p.registerCommand({
        name: "femboy",
        displayName: "femboy",
        description: "Get an image of a femboy",
        displayDescription: "Get an image of a femboy",
        options: [
            { name: "nsfw", displayName: "nsfw", description: "Use NSFW subreddit", required: false, type: 5 },
            { name: "sort", displayName: "sort", description: "Reddit sorting method", required: false, type: 3 },
            { name: "silent", displayName: "silent", description: "Only you can see the message", required: false, type: 5 }
        ],
        applicationId: "-1",
        inputType: 1,
        type: 1,
        execute: async function(args, context) {
            try {
                let nsfw = args.find(o => o.name === "nsfw")?.value;
                let sort = args.find(o => o.name === "sort")?.value ?? r.storage.sortdefs;
                let silent = args.find(o => o.name === "silent")?.value ?? true;

                if (!["best", "hot", "new", "rising", "top", "controversial"].includes(sort)) {
                    sendBotMessage(context.channel.id, "Invalid sorting type. Valid options: best, hot, new, rising, top, controversial.");
                    return;
                }

                let subreddit = bus;
                let response = await fetch(`https://www.reddit.com/r/${subreddit}/${sort}.json?limit=100`).then(res => res.json());

                if (!context.channel.nsfw_ && nsfw && r.storage.nsfwwarn && silent) {
                    sendBotMessage(context.channel.id, "This channel is not marked as NSFW.\n(You can disable this check in plugin settings)");
                    return;
                }

                let post = response.data?.children?.[Math.floor(Math.random() * response.data.children.length)]?.data;
                let authorData = await fetch(`https://www.reddit.com/u/${post?.author}/about.json`).then(res => res.json());

                if (silent) {
                    sendBotMessage(context.channel.id, "", [{
                        type: "rich",
                        title: post?.title,
                        url: `https://reddit.com${post?.permalink}`,
                        author: {
                            name: `u/${post?.author} • r/${post?.subreddit}`,
                            proxy_icon_url: authorData?.data.icon_img.split("?")[0],
                            icon_url: authorData?.data.icon_img.split("?")[0]
                        },
                        image: {
                            proxy_url: post?.url_overridden_by_dest.replace(/.gifv$/g, ".gif") ?? post?.url.replace(/.gifv$/g, ".gif"),
                            url: post?.url_overridden_by_dest?.replace(/.gifv$/g, ".gif") ?? post?.url?.replace(/.gifv$/g, ".gif"),
                            width: post?.preview?.images?.[0]?.source?.width,
                            height: post?.preview?.images?.[0]?.source?.height
                        },
                        color: "0xf4b8e4"
                    }]);
                } else {
                    messaging.sendMessage(context.channel.id, { content: post?.url_overridden_by_dest ?? post?.url });
                }
            } catch (error) {
                y.logger.log(error);
                sendBotMessage(context.channel.id, "ERROR! Check debug logs!");
            }
        }
    }));

    function onLoad() {
        r.storage.nsfwwarn ??= true;
        r.storage.sortdefs ??= "new";
    }

    function onUnload() {
        for (const unregister of commands) unregister();
    }

    c.onLoad = onLoad;
    c.onUnload = onUnload;
    c.settings = PluginSettings;

})(
    {},
    vendetta.commands,
    vendetta,
    vendetta.metro,
    vendetta.ui.components,
    vendetta.plugin,
    vendetta.storage,
    vendetta.ui.assets
);
