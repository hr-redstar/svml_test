// hikkake_bot/utils/hikkakePlakamaSubmit.js
const { readState, writeState } = require('./hikkakeStateManager');
const { updateAllHikkakePanels } = require('./hikkakePanelManager');
const { logToThread } = require('./threadLogger');

module.exports = {
  customId: /^hikkake_plakama_modal_(quest|tosu|horse)$/,
  async handle(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const [, type] = interaction.customId.match(this.customId);
    const puraCount = parseInt(interaction.fields.getTextInputValue('pura_count'), 10);
    const kamaCount = parseInt(interaction.fields.getTextInputValue('kama_count'), 10);

    if (isNaN(puraCount) || isNaN(kamaCount) || puraCount < 0 || kamaCount < 0) {
      return interaction.editReply({ content: '人数は0以上の半角数字で入力してください。' });
    }

    const guildId = interaction.guildId;
    const state = await readState(guildId);

    state.staff[type].pura = puraCount;
    state.staff[type].kama = kamaCount;

    await writeState(guildId, state);
    await updateAllHikkakePanels(interaction.client, guildId, state);

    try {
      await logToThread(guildId, type, interaction.client, {
        user: interaction.user,
        logType: 'プラカマ設定',
        details: { pura: puraCount, kama: kamaCount },
        channelName: interaction.channel.name,
      });
    } catch (e) {
      console.warn('[hikkakePlakamaSubmit] ログ出力失敗', e);
    }

    await interaction.editReply({ content: `✅ 【${type.toUpperCase()}】の基本スタッフを プラ: ${puraCount}人, カマ: ${kamaCount}人 に設定しました。` });
  }
};