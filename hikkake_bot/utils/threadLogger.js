// utils/threadLogger.js

const { readState, writeState } = require('./hikkakeStateManager');
const { DateTime } = require('luxon');

const LOG_THREAD_PREFIX = {
  quest: 'クエストログ_',
  tosu: '凸スナログ_',
  horse: 'トロイログ_',
};

// ログメッセージのフォーマット
function formatLogMessage(now, logData) {
  const { user, logType, details, channelName } = logData;
  const time = now.toFormat('MM/dd HH:mm');
  const base = `📝【${time}】**${user?.username || user?.tag || '不明ユーザー'}** が #${channelName} で`;

  switch (logType) {
    case 'プラカマ設定':
      return `${base} **基本スタッフ** を更新 (プラ: ${details.pura ?? '-'}人, カマ: ${details.kama ?? '-'}人)`;
    case '受注': {
      const totalCast = (details.castPura || 0) + (details.castKama || 0);
      return `${base} **受注** を登録 (人数: ${details.people}人, 本数: ${details.bottles}本, キャスト消費: -${totalCast}人 [プ${details.castPura}/カ${details.castKama}])`;
    }
    case 'ふらっと来た':
      return `${base} **ふらっと来た** スタッフを追加 (プラ: +${details.pura ?? '-'}人, カマ: +${details.kama ?? '-'}人)`;
    default:
      return `📝【${time}】${user?.username || user?.tag || '不明ユーザー'} が操作しました。`;
  }
}

// スレッドの取得または作成
async function getOrCreateThread({ guildId, type, client, logKey, state, logChannel }) {
  const threadName = `${LOG_THREAD_PREFIX[type]}${logKey}`;
  let thread = null;

  // 既存スレッドの再取得
  const existingThreadId = state.logs?.[type]?.[logKey];
  if (existingThreadId) {
    try {
      thread = await logChannel.threads.fetch(existingThreadId);
    } catch (e) {
      console.warn(`[ログスレッド取得失敗] ${threadName}:`, e.message);
    }
  }

  // 存在しなければ新規作成
  if (!thread) {
    thread = await logChannel.threads.create({
      name: threadName,
      autoArchiveDuration: 10080, // 7日
    });

    // state を更新
    if (!state.logs) state.logs = {};
    if (!state.logs[type]) state.logs[type] = {};
    state.logs[type][logKey] = thread.id;
    await writeState(guildId, state);
  }

  return thread;
}

// メイン関数：ログをスレッドに送信
async function logToThread(guildId, type, client, logData) {
  const now = DateTime.now().setZone('Asia/Tokyo');
  const logKey = now.toFormat('yyyyMM'); // 例: 202507

  const state = await readState(guildId);
  const logChannelId = state.logChannels?.[type];
  if (!logChannelId) return;

  const logChannel = await client.channels.fetch(logChannelId);
  if (!logChannel?.isTextBased()) return;

  const thread = await getOrCreateThread({
    guildId,
    type,
    client,
    logKey,
    state,
    logChannel,
  });

  if (!thread) return;

  const message = formatLogMessage(now, logData);
  const sentMessage = await thread.send(message);
  return sentMessage;
}

module.exports = { logToThread };
