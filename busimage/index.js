(function(c, p, y, d, u, r, w, b) {
    "use strict";

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

    const messaging = d.findByProps("sendMessage", "receiveMessage");
    const channelUtils = d.findByProps("getLastSelectedChannelId");
    const messageCreator = d.findByProps("createBotMessage");

    let commands = [];

    commands.push(p.registerCommand({
        name: "bus",
        displayName: "bus",
        description: "Get an image of a bus",
        displayDescription: "Get an image of a bus",
        options: [
            { name: "sort", displayName: "sort", description: "Reddit sorting method", required: true, type: 3 }
        ],
        applicationId: "-1",
        inputType: 1,
        type: 1,
        execute: async function(args, context) {
            try {
                let nsfw = args.find(o => o.name === "nsfw")?.value;
                let sort = args.find(o => o.name === "sort")?.value ?? r.storage.sortdefs;

                if (!["best", "hot", "new", "rising", "top", "controversial"].includes(sort)) {
                    messaging.sendMessage(context.channel.id, { content: "Invalid sorting type. Valid options: best, hot, new, rising, top, controversial." });
                    return;
                }

                let response = await fetch(`https://www.reddit.com/r/bus/${sort}.json?limit=100`).then(res => res.json());
                let post = response.data?.children?.[Math.floor(Math.random() * response.data.children.length)]?.data;
                let imageUrl = post?.url_overridden_by_dest?.replace(/.gifv$/g, ".gif") ?? post?.url?.replace(/.gifv$/g, ".gif");
                
                if (imageUrl) {
                    messaging.sendMessage(context.channel.id, { content: imageUrl });
                } else {
                    messaging.sendMessage(context.channel.id, { content: "No valid image found." });
                }
            } catch (error) {
                y.logger.log(error);
                messaging.sendMessage(context.channel.id, { content: "ERROR! Check debug logs!" });
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
