// utils/discordUtils.js

const { client } = require('../client'); // クライアント本体

async function getGuild(guildId) {
  try {
    return await client.guilds.fetch(guildId);
  } catch (e) {
    console.warn(`[getGuild] Guild fetch failed: ${e.message}`);
    return null;
  }
}

module.exports = { getGuild };
