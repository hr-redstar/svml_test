// utils/discordUtils.js

const { client } = require('../client');

/**
 * ギルドをキャッシュ優先で取得し、なければAPIからフェッチ
 * @param {string} guildId
 * @returns {Promise<import('discord.js').Guild|null>}
 */
async function getGuild(guildId) {
  if (!client || !client.isReady()) {
    console.warn('[getGuild] clientが準備できていません。');
    return null;
  }

  try {
    // キャッシュにあれば即返す
    const cachedGuild = client.guilds.cache.get(guildId);
    if (cachedGuild) return cachedGuild;

    // キャッシュになければAPIから取得
    const fetchedGuild = await client.guilds.fetch(guildId);
    return fetchedGuild ?? null;
  } catch (error) {
    console.warn(`[getGuild] Failed to fetch guild (${guildId}): ${error.message}`);
    return null;
  }
}

module.exports = { getGuild };
