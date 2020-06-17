module.exports.run = async (client) => {
  let query = [];
  Object.keys(client.dbSchema).forEach((table) => {
    let columns = [];
    Object.keys(client.dbSchema[table]).forEach((key) => {
      columns.push(`${key} ${client.dbSchema[table][key]}`)
    });
    query.push(`DROP TABLE ${table};CREATE TABLE ${table} (${columns.join(', ')})`);
    let insertQuery = [];
    switch (table) {
      case 'permissionDB':
        ['User',
          'Verified',
          'Redd',
          'Head Redd',
          'Mod',
          'Head Mod',
          'Admin',
          'Server Owner',
          'Bot Support',
          'Bot Admin',
          'Bot Owner']
          .forEach((v, i) => insertQuery.push(`('${i}', ${i}, '${v}')`));
        break;
      case 'configDB':
        insertQuery = [
          "('banAppealLink', 'https://github.com/ambravl/leifbot/blob/testdidntwork/src/dbUser.js', 'text', '')",
          "('sesCategory', '', 'text', '698388740040556586')",
          "('prefix', '.', 'text', '')",
          "('playlist', 'PLmJ4dQSfFie-81me0jlzewxPIxKuO2-sI', 'text', '')",
          "('music', '718645777399808001', 'text', '721429219187359794')",
          "('musicText', '720055418923122788', 'text', '720568062490705931')",
          "('staffChat', '718581551331409971', 'text', '720568062490705931')",
          "('modLog', '720058757954011231', 'text', '720568062490705931')",
          "('reportMail', '720058757954011231', 'text', '720568062490705931')",
          "('modMailGuild', '', 'text', '')",
          "('mainGuild', '717575621420646432', 'text', '435195075375661067')",
          "('raidJoinCount', '10', 'int', '1')",
          "('raidJoinsPerSecond', '10', 'int', '1')",
          "('joinLeaveLog', '717575621961580609', 'text', '720057918791090212')",
          "('actionLog', '720057918791090212', 'text', '720568062490705931')",
          "('mutedRole', '', 'text', '')",
          "('imageOnlyChannels', '', 'array', '718192476828991550')",
          "('newlineLimitChannels', '', 'array', '718192476828991550')",
          "('newlineLimit', '10', 'int', '')",
          "('imageLinkLimit', '3', 'int', '')",
          "('noMentionChannels', '', 'array', '718192476828991550')",
          "('ignoreChannel', '', 'array', '698388868235526164')",
          "('ignoreMember', '', 'array', '')",
          "('announcementsChannel', '', 'text', '716935607934386257')",
          "('positiveRepLimit', '100', 'int', '')",
          "('negativeRepLimit', '5', 'int', '')",
          "('botCommands', '718592382194417754', 'text', '720568062490705931')",
          "('giveawayChannel', '717599016665350164', 'text', '716935607934386257')",
          "('roleChannel', '718647593319530536', 'text', '720568062490705931')"
        ];
        break;
      case 'adoptees':
        const fs = require('fs');

        try {
          const data = fs.readFileSync('src/villagers.txt', 'utf8');
          const fixedData = data.split('\n');

          fixedData.forEach((vil) => {
            insertQuery.push(`('${vil.trim()}', '')`);
          });
        } catch (e) {
          console.error(e);
        }
        break;
    }
    if (insertQuery && insertQuery.length > 0) query.push(`INSERT INTO ${table} VALUES ${insertQuery.join(', ')}`);
  });
  return query.join('; ')
};