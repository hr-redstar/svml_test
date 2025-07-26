const { readJsonFromGCS } = require('./gcs');

/**
 * リアクション文を取得（カテゴリ・種類・人数/本数）
 * @param {string} guildId 
 * @param {"quest"|"tosu"|"horse"} type 
 * @param {"num"|"count"} key 
 * @param {number} value 
 * @returns {Promise<string|null>}
 */
async function getRandomReactionMessage(guildId, type, key, value) {
  try {
    const path = `hikkake/${guildId}/reactions.json`;
    const data = await readJsonFromGCS(path);

    const reactions = data?.[type]?.[key]?.[value];
    if (reactions && reactions.length > 0) {
      const index = Math.floor(Math.random() * reactions.length);
      return reactions[index];
    }
    return null;
  } catch (e) {
    console.error('[ReactionFetchError]', e);
    return null;
  }
}

module.exports = { getRandomReactionMessage };
