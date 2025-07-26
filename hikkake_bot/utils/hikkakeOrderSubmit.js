// hikkake_bot/utils/hikkakeOrderSubmit.js

const { readState, writeState } = require('./hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('./panelBuilder');
const { logToThread } = require('./threadLogger');

async function updateAllPanels(interaction, state) {
  for (const key of ['quest', 'tosu', 'horse']) {
    const panelInfo = state.panelMessages?.[key];
    if (!panelInfo) continue;

    try {
      const channel = await interaction.client.channels.fetch(panelInfo.channelId);
      const msg = await channel.messages.fetch(panelInfo.messageId);
      const embed = buildPanelEmbed(key, state.counts?.[key]);
      const buttons = buildPanelButtons(key);
      await msg.edit({ embeds: [embed], components: [buttons] });
    } catch (e) {
      console.warn(`[hikkakeOrderSubmit] パネル更新失敗: ${key}`, e.message);
    }
  }
}

module.exports = {
  customId: /^hikkake_order_modal_(quest|tosu|horse)$/,
  async handle(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const [, type] = interaction.customId.match(this.customId);
    const orderCount = parseInt(interaction.fields.getTextInputValue('order_count'), 10);

    if (isNaN(orderCount) || orderCount < 0) {
      return interaction.editReply({ content: '受注人数は0以上の半角数字で入力してください。' });
    }

    const guildId = interaction.guildId;
    const state = await readState(guildId);
    const targetCounts = state.counts[type];

    if (!targetCounts) {
      return interaction.editReply({ content: '対象のデータが見つかりません。' });
    }

    // プラから優先的に減算し、足りなければカマから