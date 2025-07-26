const { Storage } = require('@google-cloud/storage');

const bucketName = 'data-svml';
const basePath = 'hikkake';

const storage = new Storage();

function getReactionFilePath(guildId) {
  return `${basePath}/${guildId}/reactions.json`;
}

function getDefaultReactions() {
  return {
    quest: {},  // e.g. quest["1人"] = ["ありがとう！", "助かる！"]
    tosu: {},
    horse: {}
  };
}

async function readReactions(guildId) {
  const file = storage.bucket(bucketName).file(getReactionFilePath(guildId));
  try {
    const [contents] = await file.download();
    return JSON.parse(contents.toString());
  } catch (e) {
    console.warn(`[GCS] 初期reaction作成: ${getReactionFilePath(guildId)}`);
    return getDefaultReactions();
  }
}

async function writeReactions(guildId, reactionsData) {
  const file = storage.bucket(bucketName).file(getReactionFilePath(guildId));
  await file.save(JSON.stringify(reactionsData, null, 2));
}

function getRandomReaction(reactions, type, key) {
  const list = (reactions?.[type]?.[key] || []);
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = {
  readReactions,
  writeReactions,
  getRandomReaction,
};
