// hikkake_bot/utils/hikkakeCasualSubmit.js

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
      console.warn(`[hikkakeCasualSubmit] パネル更新失敗: ${key}`, e.message);
    }
  }
}

module.exports = {
  customId: /^hikkake_casual_modal_(quest|tosu|horse)$/,
  async handle(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const [, type] = interaction.customId.match(this.customId);
    const casualCount = parseInt(interaction.fields.getTextInputValue('casual_count'), 10);

    if (isNaN(casualCount) || casualCount < 0) {
      return interaction.editReply({ content: '人数は0以上の半角数字で入力してください。' });
    }

    const guildId = interaction.guildId;
    const state = await readState(guildId);

    if (!state.counts[type]) state.counts[type] = { pura: 0, kama: 0, casual: 0 };
    state.counts[type].casual = casualCount;

    await writeState(guildId, state);
    await updateAllPanels(interaction, state);

    try {
      await logToThread(guildId, type, interaction.client, {
        user: interaction.user,
        logType: 'ふらっと来た',
        details: { casual: casualCount },
        channelName: interaction.channel.name,
      });
    } catch (e) {
      console.warn('[hikkakeCasualSubmit] ログ出力失敗', e);
    }

    await interaction.editReply({ content: `【${type.toUpperCase()}】の「ふらっと来た」人数を ${casualCount}人 に更新しました。` });
  }
};