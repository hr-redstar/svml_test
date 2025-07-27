// hikkake_bot/utils/hikkakePurakamaSelect.js

const { InteractionResponseFlags } = require('discord.js');
const { readState, writeState } = require('./hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');
const { logToThread } = require('../utils/threadLogger');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_plakama_select$/,
  async handle(interaction) {
    const [, type] = interaction.customId.split('_');
    const selectedValue = interaction.values[0]; // 例: "5"
    const puraCount = parseInt(selectedValue, 10);

    if (isNaN(puraCount) || puraCount < 0) {
      return interaction.reply({
        content: '人数は0以上の半角数字で選択してください。',
        flags: InteractionResponseFlags.Ephemeral,
      });
    }

    const guildId = interaction.guildId;
    const state = await readState(guildId);

    // counts初期化
    if (!state.counts) state.counts = {};
    if (!state.counts[type]) state.counts[type] = { pura: 0, kama: 0 };

    // プラカマ人数更新
    state.counts[type].pura = puraCount;

    await writeState(guildId, state);

    // 3種類すべてのパネルを更新
    for (const key of ['quest', 'tosu', 'horse']) {
      const panelInfo = state.panelMessages?.[key];
      if (!panelInfo) continue;

      try {
        const channel = await interaction.client.channels.fetch(panelInfo.channelId);
        const msg = await channel.messages.fetch(panelInfo.messageId);

        // buildPanelEmbedの引数を { plakama, flat, order } 形式に統一
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
        console.warn(`[hikkakePurakamaSelect] パネル更新失敗: ${key}`, e);
      }
    }

    // ログスレッドにプラカマ更新ログを記録
    try {
      const user = interaction.user;
      const channelName = interaction.channel.name;
      await logToThread(guildId, type, interaction.client, {
        user,
        logType: 'プラカマ',
        details: { pura: puraCount },
        channelName,
      });
    } catch (e) {
      console.warn('[hikkakePurakamaSelect] ログスレッド出力失敗', e);
    }

    await interaction.reply({
      content: `【${type.toUpperCase()}】のプラ人数を${puraCount}人に更新しました。`,
      flags: InteractionResponseFlags.Ephemeral,
    });
  },
};
