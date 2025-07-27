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
    panelMessages: {
      quest: null,
      tosu: null,
      horse: null,
    },
    counts: {
      quest: { pura: 0, kama: 0, casual: 0 },
      tosu: { pura: 0, kama: 0, casual: 0 },
      horse: { pura: 0, kama: 0, casual: 0 },
    },
    logChannels: {
      quest: null,
      tosu: null,
      horse: null,
    },
    logs: {
      quest: {},
      tosu: {},
      horse: {},
    }
  };
}

function ensureStateStructure(state) {
  const types = ['quest', 'tosu', 'horse'];
  if (!state.panelMessages) state.panelMessages = {};
  if (!state.counts) state.counts = {};
  if (!state.logChannels) state.logChannels = {};
  if (!state.logs) state.logs = {};

  for (const type of types) {
    if (!state.counts[type]) {
      state.counts[type] = { pura: 0, kama: 0, casual: 0 };
    }
    if (typeof state.counts[type].casual !== 'number') state.counts[type].casual = 0;

    if (!state.logs[type]) state.logs[type] = {};
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
