(function (c, p, y, d, u, r, w, b) {
    "use strict";
  
    // Importation des composants nécessaires
    const { ScrollView } = u.General;
    const { FormSection, FormRadioRow, FormSwitchRow, FormIcon } = u.Forms;
  
    // Fonction pour les paramètres du plugin
    function Settings() {
      w.useProxy(r.storage);
  
      return (
        React.createElement(ScrollView, null,
          React.createElement(FormSection, { title: "Misc Settings", titleStyleType: "no_border" }),
          React.createElement(FormSwitchRow, {
            label: "NSFW Warning",
            subLabel: "Warn when sending an NSFW image in a non-NSFW channel.",
            leading: React.createElement(FormIcon, { source: b.getAssetIDByName("ic_warning_24px") }),
            value: r.storage.nsfwwarn,
            onValueChange: (n) => r.storage.nsfwwarn = n
          }),
          React.createElement(FormSection, { title: "Default Sort", titleStyleType: "no_border" },
            Object.entries({ Best: "best", Hot: "hot", New: "new", Rising: "rising", Top: "top", Controversial: "controversial" })
              .map(([label, value]) =>
                React.createElement(FormRadioRow, {
                  label,
                  selected: r.storage.sortdefs === value,
                  onPress: () => r.storage.sortdefs = value
                })
              )
          )
        )
      );
    }
  
    // Références aux modules Discord
    const messagesModule = d.findByProps("sendMessage", "receiveMessage");
    const channelModule = d.findByProps("getLastSelectedChannelId");
    const botMessageModule = d.findByProps("createBotMessage");
    const botAvatarsModule = d.findByProps("BOT_AVATARS");
  
    // Fonction pour envoyer un message bot
    function sendBotMessage(channelId, content, embeds = []) {
      const id = channelId ?? channelModule?.getChannelId?.();
      const message = botMessageModule.createBotMessage({ channelId: id, content: "", embeds });
  
      message.author.username = "CatBot";
      message.author.avatar = "CatBot";
      botAvatarsModule.BOT_AVATARS.CatBot = "https://i.imgur.com/JfPpwOA.png";
  
      if (typeof content === "string") {
        message.content = content;
      } else {
        Object.assign(message, content);
      }
      
      messagesModule.receiveMessage(id, message);
    }
  
    // Liste des commandes
    let commands = [];
  
    commands.push(p.registerCommand({
      name: "cat",
      displayName: "cat",
      description: "Get an image of a cat",
      options: [
        { name: "sort", displayName: "sort", description: "Change Reddit sorting", required: false, type: 3 },
        { name: "silent", displayName: "silent", description: "Make message visible only to you", required: false, type: 5 }
      ],
      execute: async function (args, context) {
        try {
          let sortArg = args.find(arg => arg.name === "sort");
          // Use r.storage.sortdefs as the default value, and fallback to "new" if it's not defined
          let sort = sortArg && sortArg.value ? sortArg.value : (r.storage.sortdefs || "new");
          let silent = args.find(arg => arg.name === "silent")?.value;
  
          if (!["best", "hot", "new", "rising", "top", "controversial"].includes(sort)) {
            sendBotMessage(context.channel.id, "Invalid sorting type. Valid options are: `best`, `hot`, `new`, `rising`, `top`, `controversial`.", []);
            return;
          }
  
          let subreddit = "cats";
          let response = await fetch(`https://www.reddit.com/r/${subreddit}/${sort}.json?limit=100`).then(res => res.json());
  
          let post = response.data?.children?.[Math.floor(Math.random() * response.data?.children?.length)]?.data;
          let authorData = await fetch(`https://www.reddit.com/u/${post?.author}/about.json`).then(res => res.json());
  
          if (silent ?? true) {
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
            messagesModule.sendMessage(context.channel.id, { content: post?.url_overridden_by_dest ?? post?.url });
          }
        } catch (error) {
          y.logger.log(error);
          sendBotMessage(context.channel.id, "ERROR !!! 😭😭😭 Check debug logs!! 🥺🥺🥺", []);
        }
      }
    }));
  
    // Initialisation et destruction du plugin
    function onLoad() {
      r.storage.nsfwwarn ??= true;
      r.storage.sortdefs ??= "new";
    }
  
    function onUnload() {
      for (const unregister of commands) unregister();
    }
  
    c.onLoad = onLoad;
    c.onUnload = onUnload;
    c.settings = Settings;
  
  })(
    {}, vendetta.commands, vendetta, vendetta.metro, vendetta.ui.components, vendetta.plugin, vendetta.storage, vendetta.ui.assets
  );
