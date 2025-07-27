// interactions/hikkakeOrderSelect.js

const { readState, writeState } = require('../utils/hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');
const { logToThread } = require('../utils/threadLogger');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_order_select$/,

  async handle(interaction) {
    const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_order_select$/);
    if (!match) return;

    const type = match[1];
    const selected = parseInt(interaction.values[0], 10);

    if (isNaN(selected) || selected < 1) {
      return interaction.reply({
        content: '⚠️ 無効な選択です。1人以上を選んでください。',
        ephemeral: true,
      });
    }

    const guildId = interaction.guildId;
    const channelId = interaction.channelId;
    const channelName = interaction.channel?.name || '不明チャンネル';

    try {
      const state = await readState(guildId);
      state.counts ??= {};
      state.counts[type] ??= { pura: 0, kama: 0, casual: 0 };
      state[type] ??= {};
      state[type][channelId] ??= { pura: 0, kama: 0, orders: [], messageId: null };

      const globalCount = state.counts[type];
      const panel = state[type][channelId];

      // 人数を引く処理
      const totalBefore = globalCount.pura + globalCount.kama;
      const deducted = Math.min(selected, totalBefore);
      const fromPura = Math.min(globalCount.pura, deducted);
      const fromKama = deducted - fromPura;

      globalCount.pura -= fromPura;
      globalCount.kama -= fromKama;

      // ログ記録
      panel.orders.push({
        user: interaction.user.tag,
        count: deducted,
        timestamp: new Date().toISOString(),
        channel: channelName,
      });

      await writeState(guildId, state);

      // メッセージ更新
      if (panel.messageId) {
        try {
          const embed = buildPanelEmbed(type, panel, globalCount);
          const components = buildPanelButtons(type);
          const msg = await interaction.channel.messages.fetch(panel.messageId);
          await msg.edit({ embeds: [embed], components, content: '' });
        } catch (e) {
          console.warn(`[${type}] メッセージ更新失敗:`, e);
        }
      } else {
        console.warn(`[${type}] messageId が設定されていません。`);
      }

      // スレッドログ出力
      await logToThread(guildId, type, interaction.client, {
        user: interaction.user.tag,
        logType: '受注',
        details: {
          requested: selected,
          deductedFrom: { pura: fromPura, kama: fromKama },
        },
        channelName,
      });

      await interaction.reply({
        content: `✅ **${selected}人** の受注を記録しました。\n（内訳：プラ ${fromPura} / カマ ${fromKama}）`,
        ephemeral: true,
      });

    } catch (err) {
      console.error('[hikkakeOrderSelect] エラー:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⚠️ 処理中にエラーが発生しました。',
          ephemeral: true,
        });
      }
    }
  },
};
