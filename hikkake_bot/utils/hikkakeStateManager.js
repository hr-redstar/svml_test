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
  return {
    panelMessages: {
      quest: null,
      tosu: null,
      horse: null,
    },
    counts: {
      quest: { pura: 0, kama: 0, casual: 0, entries: [] },
      tosu: { pura: 0, kama: 0, casual: 0, entries: [] },
      horse: { pura: 0, kama: 0, casual: 0, entries: [] },
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

    // counts の構造を getDefaultState と合わせる
    if (!state.counts[type] || typeof state.counts[type] !== 'object') {
      state.counts[type] = { pura: 0, kama: 0, casual: 0, entries: [] };
    }

    // 安全チェックと初期化を新しい構造に合わせる
    const ct = state.counts[type];
    if (typeof ct.pura !== 'number') ct.pura = 0;
    if (typeof ct.kama !== 'number') ct.kama = 0;
    if (typeof ct.casual !== 'number') ct.casual = 0;
    if (!Array.isArray(ct.entries)) ct.entries = [];

    // 古いプロパティや不要なプロパティを削除
    if ('bottles' in ct) delete ct.bottles;
    // 今後不要なプロパティがあればここで削除
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
    // ファイルが存在しないエラー(404)は初回起動時の正常な動作なので、それ以外を警告として扱う
    if (e.code !== 404) {
      console.warn(`[GCS] state読み込み失敗: ${getFilePath(guildId)} - ${e.message}`);
    } else {
      console.log(`[GCS] 初期state作成: ${getFilePath(guildId)}`);
    }
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
