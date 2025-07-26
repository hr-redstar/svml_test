const { Storage } = require('@google-cloud/storage');
const path = require('path');

const bucketName = 'data-svml'; // 固定
const basePath = 'hikkake'; // フォルダ構成: hikkake/<GUILD_ID>/state.json

const storage = new Storage();

function getFilePath(guildId) {
  return `${basePath}/${guildId}/state.json`;
}

function getDefaultState() {
  return {
    quest: { panel: [], order: 0, plakama: 0, flat: 0 },
    tosu: { panel: [], order: 0, plakama: 0, flat: 0 },
    horse: { panel: [], order: 0, plakama: 0, flat: 0 },
  };
}

function ensureStateStructure(state) {
  const types = ['quest', 'tosu', 'horse'];
  for (const type of types) {
    if (!state[type]) state[type] = { panel: [], order: 0, plakama: 0, flat: 0 };
    if (!Array.isArray(state[type].panel)) state[type].panel = [];
    if (typeof state[type].order !== 'number') state[type].order = 0;
    if (typeof state[type].plakama !== 'number') state[type].plakama = 0;
    if (typeof state[type].flat !== 'number') state[type].flat = 0;
  }
  return state;
}

async function readState(guildId) {
  const file = storage.bucket(bucketName).file(getFilePath(guildId));
  try {
    const [contents] = await file.download();
    const rawState = JSON.parse(contents.toString());
    return ensureStateStructure(rawState);
  } catch (e) {
    console.warn(`[GCS] 初期state作成: ${getFilePath(guildId)}`);
    return getDefaultState();
  }
}

async function writeState(guildId, stateData) {
  const file = storage.bucket(bucketName).file(getFilePath(guildId));
  await file.save(JSON.stringify(stateData, null, 2));
}

module.exports = {
  readState,
  writeState,
  ensureStateStructure,
  getDefaultState,
};
