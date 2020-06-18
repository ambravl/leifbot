module.exports.run = (client, message, args) => {
  if (!args) return;
  const link = /http.?:..discordapp.com.channels.([0-9]+).([0-9]+).([0-9]+)/.exec(args[0]);
  const roleType = args.length === 2 ? args[1] : 'exclusive';
  const emojiRE = /(?:(?:<a?:\w+:([\d]+)>)|(\p{Emoji})).+?([a-zA-Z ]+)/gu;
  if (!link) return;
  client.channels.cache.get(link[2]).messages.fetch(link[3])
    .then((msg) => {
      console.log('fetched message');
      let emojiArray;
      client.reactionRoles.insert(link[3], [link[2], roleType], ['channelID', 'type'])
        .then(() => {
          console.log('inserted into reaction db');
          console.log(msg.content);
          while ((emojiArray = emojiRE.exec(msg.content) !== null)) {
            console.log(emojiArray);
            console.log(emojiArray[3]);
            let emojiID;
            if (emojiArray[0]) emojiID = emojiArray[0];
            else if (emojiArray[1]) emojiID = message.guild.emojis.cache.find(emoji => emoji.name === emojiArray[1]).identifier;
            if (emojiID && emojiArray[2]) {
              const roleID = message.guild.roles.cache.find((r) => r.name.toLowerCase() === emojiArray[2].trim().toLowerCase());
              msg.react(emojiID)
                .then(() => {
                  console.log(`reacted with ${emojiID}`)
                });
              client.reactionRoles.push(link[3], {roleID: roleID, emojiID: emojiID}, 'reactions');
            }
          }
        })

    })
};


module.exports.conf = {
  guildOnly: true,
  aliases: [],
  permLevel: 'Mod',
  args: 1,
};

module.exports.help = {
  name: 'roles',
  category: 'moderation',
  description: 'Makes it so Leif listens to reactions to a message and assigns roles accordingly',
  usage: 'roles <link>',
  details: "<link> => The link to the message listing roles.",
};