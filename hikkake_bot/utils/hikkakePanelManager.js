// hikkake_bot/utils/hikkakePanelManager.js

const { buildPanelEmbed, buildPanelButtons } = require('./panelBuilder');

/**
 * すべてのhikkake_botパネル（店内状況と受注一覧）を更新します。
 * @param {import('discord.js').Client} client
 * @param {string} guildId
 * @param {object} state stateManagerから取得した現在の状態オブジェクト
 */
async function updateAllHikkakePanels(client, guildId, state) {
  for (const type of ['quest', 'tosu', 'horse']) {
    const panelInfo = state.panelMessages?.[type];
    if (!panelInfo || !panelInfo.channelId || !panelInfo.statusMessageId || !panelInfo.ordersMessageId) {
      continue;
    }

    try {
      const channel = await client.channels.fetch(panelInfo.channelId);
      if (!channel || !channel.isTextBased()) continue;

      // 店内状況パネルを更新
      const statusMsg = await channel.messages.fetch(panelInfo.statusMessageId);
      const statusEmbed = buildPanelEmbed('status', type, state, guildId);
      const buttons = buildPanelButtons(type);
      await statusMsg.edit({ embeds: [statusEmbed], components: buttons });

      // 受注一覧パネルを更新
      const ordersMsg = await channel.messages.fetch(panelInfo.ordersMessageId);
      const ordersEmbed = buildPanelEmbed('orders', type, state, guildId);
      await ordersMsg.edit({ embeds: [ordersEmbed], components: [] }); // 受注一覧にはボタン不要

    } catch (error) {
      console.error(`[hikkakePanelManager] パネル更新失敗: type "${type}" in guild ${guildId}`, error);
    }
  }
}

module.exports = {
  updateAllHikkakePanels,
};