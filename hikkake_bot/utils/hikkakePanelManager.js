// utils/hikkakePanelManager.js

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

/**
 * すべてのhikkakeパネルを更新
 * @param {import('discord.js').Client} client
 * @param {string} guildId 
 * @param {object} state 
 */
async function updateAllHikkakePanels(client, guildId, state) {
  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      console.warn(`[updateAllHikkakePanels] ギルド取得失敗: ${guildId}`);
      return;
    }

    /** @type {Array<'quest' | 'tosu' | 'horse'>} */
    const panelTypes = ['quest', 'tosu', 'horse'];

    for (const type of panelTypes) {
      const panelInfo = state.panelMessages?.[type];
      if (!panelInfo) {
        console.warn(`[updateAllHikkakePanels] ${type}のpanelMessagesが見つかりません`);
        continue;
      }

      const channel = await guild.channels.fetch(panelInfo.channelId).catch(() => null);
      if (!channel || !channel.isTextBased()) {
        console.warn(`[updateAllHikkakePanels] 無効なチャンネル: ${panelInfo.channelId}`);
        continue;
      }

      const message = await channel.messages.fetch(panelInfo.messageId).catch(() => null);
      if (!message) {
        console.warn(`[updateAllHikkakePanels] メッセージ取得失敗: ${panelInfo.messageId}`);
        continue;
      }

      // countsはプラ・カマ・ふらっと人数
      const counts = state.counts?.[type] || { pura: 0, kama: 0, casual: 0 };
      // 受注人数はstate.ordersなど別管理なら取得
      const orderCount = state.orders?.[type] ?? 0;

      // Embedに渡す人数データをまとめる
      const embed = buildPanelEmbed(type, {
        plakama: (counts.pura ?? 0) + (counts.kama ?? 0),
        flat: counts.casual ?? 0,
        order: orderCount,
      });

      const components = buildPanelButtons(type);

      await message.edit({ embeds: [embed], components });
    }
  } catch (err) {
    console.error('[updateAllHikkakePanels] 想定外のエラー:', err);
  }
}

/**
 * パネル用のEmbedを生成
 * @param {'quest' | 'tosu' | 'horse'} type 
 * @param {object} data
 * @param {number} data.plakama プラ＋カマ人数合計
 * @param {number} data.flat ふらっと来ちゃった人数
 * @param {number} data.order 受注人数
 * @returns {EmbedBuilder}
 */
function buildPanelEmbed(type, data) {
  const titleMap = {
    quest: '🎯 クエスト一覧',
    tosu: '💥 凸スナ一覧',
    horse: '🐴 トロイの木馬一覧',
  };

  return new EmbedBuilder()
    .setTitle(titleMap[type] || '一覧')
    .setDescription(
      `📦 **受注人数:** ${data.order}人\n` +
      `👥 **プラカマ人数:** ${data.plakama}人\n` +
      `🚶‍♂️ **ふらっと来ちゃった:** ${data.flat}人`
    )
    .setColor(0x0099ff)
    .setFooter({ text: `最終更新: ${new Date().toLocaleString('ja-JP')}` });
}

/**
 * パネル用ボタンを生成
 * @param {'quest' | 'tosu' | 'horse'} type 
 * @returns {ActionRowBuilder[]}
 */
function buildPanelButtons(type) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_plakama`)
      .setLabel('プラカマ')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_order`)
      .setLabel('受注')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_flat`)
      .setLabel('ふらっと来ちゃった')
      .setStyle(ButtonStyle.Secondary)
  );

  return [row];
}

module.exports = {
  updateAllHikkakePanels,
  buildPanelEmbed,
  buildPanelButtons,
};
