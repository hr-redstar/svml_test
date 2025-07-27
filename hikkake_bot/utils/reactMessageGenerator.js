// utils/reactMessageGenerator.js

const { readJsonFromGCS } = require('./gcs');

/**
 * 指定されたリアクション文をランダムに取得する
 * @param {string} guildId - サーバーID
 * @param {"quest"|"tosu"|"horse"} type - カテゴリ
 * @param {"num"|"count"} key - 人数または本数
 * @param {number} value - 対象となる人数や本数
 * @returns {Promise<string|null>} - ランダムに選ばれたリアクション文、または null
 */
async function getRandomReactionMessage(guildId, type, key, value) {
  try {
    const path = `hikkake/${guildId}/reactions.json`;
    const data = await readJsonFromGCS(path);

    const reactions = data?.[type]?.[key]?.[value];
    if (Array.isArray(reactions) && reactions.length > 0) {
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
