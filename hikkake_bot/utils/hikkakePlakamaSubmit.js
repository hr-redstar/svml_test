// hikkake_bot/utils/hikkakePlakamaSubmit.js

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
      console.warn(`[hikkakePlakamaSubmit] パネル更新失敗: ${key}`, e.message);
    }
  }
}

module.exports = {
  customId: /^hikkake_plakama_modal_(quest|tosu|horse)$/,
  async handle(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const [, type] = interaction.customId.match(this.customId);
    const puraCount = parseInt(interaction.fields.getTextInputValue('pura_count'), 10);
    const kamaCount = parseInt(interaction.fields.getTextInputValue('kama_count'), 10);

    if (isNaN(puraCount) || isNaN(kamaCount)) {
      return interaction.editReply({ content: '人数は半角数字で入力してください。' });
    }

    const guildId = interaction.guildId;
    const state = await readState(guildId);

    if (!state.counts[type]) state.counts[type] = { pura: 0, kama: 0, casual: 0 };
    state.counts[type].pura = puraCount;
    state.counts[type].kama = kamaCount;

    await writeState(guildId, state);
    await updateAllPanels(interaction, state);

    try {
      await logToThread(guildId, type, interaction.client, {
        user: interaction.user,
        logType: 'プラカマ',
        details: { pura: puraCount, kama: kamaCount },
        channelName: interaction.channel.name,
      });
    } catch (e) {
      console.warn('[hikkakePlakamaSubmit] ログ出力失敗', e);
    }

    await interaction.editReply({ content: `【${type.toUpperCase()}】のプラカマを プラ: ${puraCount}人, カマ: ${kamaCount}人 に更新しました。` });
  }
};