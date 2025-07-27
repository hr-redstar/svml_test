// utils/threadLogger.js

const { readState, writeState } = require('./hikkakeStateManager');
const { DateTime } = require('luxon');

const LOG_THREAD_PREFIX = {
  quest: 'クエストログ_',
  tosu: '凸スナログ_',
  horse: 'トロイログ_',
};

function formatLogMessage(now, logData) {
  const { user, logType, details, channelName } = logData;
  const time = now.toFormat('MM/dd HH:mm');
  const base = `📝【${time}】**${user.username}** が #${channelName} で`;

  switch (logType) {
    case 'プラカマ':
      return `${base} **プラカマ** を更新 (プラ: ${details.pura}人, カマ: ${details.kama}人)`;
    case '受注':
      return `${base} **${details.requested}人** を **受注** (結果: ${details.fulfilled}人)`;
    case 'ふらっと来た':
      return `${base} **ふらっと来た** を更新 (${details.casual}人)`;
    default:
      // 以前のフォーマットとの後方互換性
      return `📝【${time}】${logData.user.username} が **${logData.count}人** を **${logData.channelName}** で操作`;
  }
}

async function logToThread(guildId, type, client, logData) {
  const now = DateTime.now().setZone('Asia/Tokyo');
  const logKey = now.toFormat('yyyyMM'); // 例: 202507

  const state = await readState(guildId);

  if (!state.logs) state.logs = {};
  if (!state.logs[type]) state.logs[type] = {};
  if (!state.logs[type][logKey]) state.logs[type][logKey] = null;

  const threadName = `${LOG_THREAD_PREFIX[type]}${logKey}`;

  // ログチャンネルがどこか調べる
  const logChannelId = state.logChannels?.[type];
  if (!logChannelId) return;

  const logChannel = await client.channels.fetch(logChannelId);
  if (!logChannel || !logChannel.isTextBased()) return;

  let thread;

  // 既存スレッドがあれば再取得
  if (state.logs[type][logKey]) {
    try {
      thread = await logChannel.threads.fetch(state.logs[type][logKey]);
    } catch (e) {
      console.warn(`スレッド取得失敗: ${threadName}`, e);
      thread = null;
    }
  }

  // なければ新規スレッドを作成
  if (!thread) {
    const createdThread = await logChannel.threads.create({
      name: threadName,
      autoArchiveDuration: 10080, // 7日
    });

    state.logs[type][logKey] = createdThread.id;
    await writeState(guildId, state);
    thread = createdThread;
  }

  // 投稿する内容
  const message = formatLogMessage(now, logData);
  await thread.send(message);
}

module.exports = { logToThread };
