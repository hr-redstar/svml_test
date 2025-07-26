// utils/threadLogger.js

const { readState, writeState } = require('./hikkakeStateManager');
const { DateTime } = require('luxon');

const LOG_THREAD_PREFIX = {
  quest: 'クエストログ_',
  tosu: '凸スナログ_',
  horse: 'トロイログ_',
};

async function logToThread(guildId, type, client, { user, count, channelName }) {
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
  const message = `📝【${now.toFormat('MM/dd HH:mm')}】${user.username} が **${count}人** を **${channelName}** で受注`;

  await thread.send(message);
}

module.exports = { logToThread };
