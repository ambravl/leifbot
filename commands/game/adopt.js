module.exports.run = (client, message, args) => {
  switch (args[0] && args[0].toLowerCase()) {
    case 'list':
    case 'l':
    case 'show':
      const msg = [];
      client.adoptees.selectSearchArray(message.author.id, 'adopters').then((res) => {
        if(res && res.rows) {
          res.rows.forEach((row) => {
            msg.push(row.name);
          })
        }
      });

      if (msg.length > 0) {
        return message.channel.send(`${client.st.adoptList}${msg.join(', ')}.`, { split: true });
      }
      return client.error(message.channel, client.st.notSigned.t, client.st.notSigned.d + '<villager name>` command.');
    case 'delete':
    case 'd':
    case 'cancel':
    case 'remove':
      if (args.length === 1) {
        // No villager name was given
        return client.error(message.channel, client.st.adNoName.t, client.st.adNoName.r);
      }
      client.adoptees.levenshtein(args.slice(1).join(' ').toProperCase())
        .then((villager) => {
          // Remove user ID of author from the list of adopters for the given villager if they are on the list already
          if(!villager) return client.error(message.channel, client.st.adWrongName.t, client.st.adWrongName.d);
          if(villager.adopters.includes(message.author.id)){
            client.adoptees.pop(villager.name, message.author.id, 'adopters')
            return client.success(message.channel, client.st.adRem.t, `${client.st.adRem.d} **${villager.target}**!`);
          }
          return client.error(message.channel, client.st.adNoList.t, `${client.st.adNoList.d} **${villager.target}**!`);
        });
      break;
    case 'check':
    case 'peek':
      if (args.length === 1) {
        // No villager name was given
        return client.error(message.channel, client.st.adNoName.t, client.st.adNoName.c);
      }
      client.adoptees.levenshtein(args.slice(1).join(' ').toProperCase())
        .then((villager) => {
          if (!villager) return client.error(message.channel, client.st.adWrongName.t, client.st.adWrongName.d);
          const vilAdoptersLength = villager.adopters.length;
          if (vilAdoptersLength > 0)
            return message.channel.send(`There are **${vilAdoptersLength}** members who wish to adopt **${villager.name}**!`);
          return message.channel.send(`${client.st.noAdopters} **${villager.name}**!`)
        })
        .catch((err) => {client.handle(err, 'ad check', undefined, message)});
      break;
    default:
      if (args.length === 0) {
        // No villager name was given
        return client.error(message.channel, client.st.adNoName.t, client.st.adNoName.a);
      }
      client.adoptees.levenshtein(args.join(' ').toProperCase())
        .then((villager) => {
          if(!villager) return client.error(message.channel, client.st.adWrongName.t, client.st.adWrongName.d);
          if (!villager.adopters.includes(message.author.id)) {
            // Add them to the list
            client.adoptees.push(villager.name, message.author.id, 'adopters');
            return client.success(message.channel, client.st.adAdded.t, `${client.st.adAdded.da}${villager.name}${client.st.adAdded.db}`);
          }
          return client.error(message.channel, client.st.adAlready.t, `${client.st.adAlready.d}${villager.target}**!`);
      })
        .catch((err) => {client.handle(err, 'adoption add', undefined, message)})
  }
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['ad'],
  permLevel: 'User',
  allowedChannels: ['549858839994826753'],
};

module.exports.help = {
  name: 'adopt',
  category: 'game',
  description: 'Allows members to be notified when a user puts a specific villager up for adoption',
  usage: 'adopt <delete|list> <villager name>',
  details: '<villager name> => Signup to be pinged when the villager you specifiy is placed up for adoption.\n<delete> => Remove yourself from the list of members to be pinged when the villager you specifiy is placed up for adoption.\n<list> => Lists all of the villagers that you have signed up to adopt.',
};
