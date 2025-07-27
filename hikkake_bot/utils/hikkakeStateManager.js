// hikkake_bot/utils/hikkakeStateManager.js

const { Storage } = require('@google-cloud/storage');
const path = require('path');

const bucketName = 'data-svml'; // 固定
const basePath = 'hikkake';     // フォルダ構成: hikkake/<GUILD_ID>/state.json

const storage = new Storage();

function getFilePath(guildId) {
  return `${basePath}/${guildId}/state.json`;
}

function getDefaultState() {
  const defaultCount = { pura: 0, kama: 0, casual: 0, entries: [] };
  return {
    panelMessages: {
      quest: null,
      tosu: null,
      horse: null,
    },
    counts: {
      quest: { ...defaultCount },
      tosu: { ...defaultCount },
      horse: { ...defaultCount },
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
    if (!state.panelMessages[type]) state.panelMessages[type] = null;
    if (!state.logChannels[type]) state.logChannels[type] = null;
    if (!state.logs[type]) state.logs[type] = {};

    if (!state.counts[type]) {
      state.counts[type] = { pura: 0, kama: 0, casual: 0, entries: [] };
    }

    // 安全チェックと初期化
    const ct = state.counts[type];
    if (typeof ct.pura !== 'number') ct.pura = 0;
    if (typeof ct.kama !== 'number') ct.kama = 0;
    if (typeof ct.casual !== 'number') ct.casual = 0;
    if (!Array.isArray(ct.entries)) ct.entries = [];
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
