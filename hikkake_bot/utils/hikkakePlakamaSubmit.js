// hikkake_bot/utils/hikkakePlakamaSubmit.js

const { readState, writeState } = require('./hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('./panelBuilder');
const { logToThread } = require('./threadLogger');
const { InteractionResponseFlags } = require('discord.js');

async function updateAllPanels(interaction, state) {
  for (const key of ['quest', 'tosu', 'horse']) {
    const panelInfo = state.panelMessages?.[key];
    if (!panelInfo) continue;

    try {
      const channel = await interaction.client.channels.fetch(panelInfo.channelId);
      const msg = await channel.messages.fetch(panelInfo.messageId);

      const counts = state.counts?.[key] || { pura: 0, kama: 0, casual: 0 };
      const orderCount = state.orders?.[key] ?? 0;

      const embed = buildPanelEmbed(key, {
        plakama: (counts.pura ?? 0) + (counts.kama ?? 0),
        flat: counts.casual ?? 0,
        order: orderCount,
      });

      const buttons = buildPanelButtons(key);
      await msg.edit({ embeds: [embed], components: buttons, content: '' }); // content: '' を明示
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

    if (isNaN(puraCount) || puraCount < 0 || isNaN(kamaCount) || kamaCount < 0) {
      return interaction.editReply({
        content: '人数は0以上の半角数字で入力してください。',
        flags: InteractionResponseFlags.Ephemeral,
      });
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

    await interaction.editReply({
      content: `【${type.toUpperCase()}】のプラカマを プラ: ${puraCount}人, カマ: ${kamaCount}人 に更新しました。`,
      flags: InteractionResponseFlags.Ephemeral,
    });
  }
};
