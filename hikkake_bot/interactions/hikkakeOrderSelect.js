// interactions/hikkakeOrderSelect.js

const { readState, writeState } = require('../utils/hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');
const { logToThread } = require('../utils/threadLogger');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_order_select$/,
  async handle(interaction) {
    try {
      const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_order_select$/);
      if (!match) return;
      const type = match[1];
      const selected = parseInt(interaction.values[0], 10);

      if (isNaN(selected) || selected < 1) {
        await interaction.reply({ content: '無効な選択です。1人以上を選んでください。', ephemeral: true });
        return;
      }

      const guildId = interaction.guildId;
      const channelId = interaction.channelId;

      const state = await readState(guildId);

      if (!state[type]) state[type] = {};
      if (!state[type][channelId]) {
        state[type][channelId] = {
          pura: 0,
          kama: 0,
          orders: [],
          messageId: null,
        };
      } else if (!Array.isArray(state[type][channelId].orders)) {
        state[type][channelId].orders = [];
      }

      const total = state[type][channelId];
      const prevSum = (total.pura ?? 0) + (total.kama ?? 0);

      const deducted = Math.min(selected, prevSum);
      if (deducted > 0) {
        const fromPura = Math.min(total.pura, deducted);
        total.pura -= fromPura;
        total.kama -= deducted - fromPura;
      }

      total.orders.push({
        user: interaction.user.tag,
        count: selected,
        timestamp: new Date().toISOString(),
        channel: interaction.channel.name,
      });

      await writeState(guildId, state);

      // buildPanelButtonsは配列を返す想定に修正
      const embed = buildPanelEmbed(type, total);
      const components = buildPanelButtons(type);

      if (total.messageId) {
        try {
          const msg = await interaction.channel.messages.fetch(total.messageId);
          await msg.edit({ embeds: [embed], components });
        } catch (e) {
          console.warn(`[メッセージ更新失敗][${type}]`, e);
        }
      } else {
        console.warn(`[${type}] messageIdが未設定です。`);
      }

      try {
        await logToThread(guildId, type, interaction.client, {
          user: interaction.user.tag,
          logType: '受注',
          details: { requested: selected },
          channelName: interaction.channel.name,
        });
      } catch (e) {
        console.warn('[スレッドログ出力失敗]', e);
      }

      await interaction.reply({
        content: `${selected}人受注を記録しました。`,
        ephemeral: true,
      });
    } catch (err) {
      console.error('[hikkakeOrderSelect] エラー:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '処理中にエラーが発生しました。', ephemeral: true });
      }
    }
  },
};
