// interactions/hikkakeOrderSelect.js

const { readState, writeState } = require('../utils/hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');
const { logToThread } = require('../utils/threadLogger');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_order_select$/,
  async handle(interaction) {
    const type = interaction.customId.split('_')[1];
    const selected = parseInt(interaction.values[0], 10);
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const channelId = interaction.channelId;

    const state = await readState(guildId);

    // 状態初期化
    if (!state[type]) state[type] = {};
    if (!state[type][channelId]) {
      state[type][channelId] = {
        pura: 0,
        kama: 0,
        orders: [],
        messageId: null,
      };
    }

    // プラカマから減算（受注）
    const total = state[type][channelId];
    const prevSum = total.pura + total.kama;

    const deducted = Math.min(selected, prevSum);
    if (deducted > 0) {
      // プラ → カマ の順に減らす
      const fromPura = Math.min(total.pura, deducted);
      total.pura -= fromPura;
      total.kama -= deducted - fromPura;
    }

    // ログ記録
    state[type][channelId].orders.push({
      user: interaction.user.username,
      count: selected,
      timestamp: new Date().toISOString(),
      channel: interaction.channel.name,
    });

    await writeState(guildId, state);

    // パネル更新
    const embed = buildPanelEmbed(type, state[type][channelId]);
    const components = [buildPanelButtons(type)];

    try {
      const msg = await interaction.channel.messages.fetch(state[type][channelId].messageId);
      await msg.edit({ embeds: [embed], components });
    } catch (e) {
      console.warn(`[メッセージ更新失敗]`, e);
    }

    // スレッドログ出力
    await logToThread(guildId, type, interaction.client, {
      user: interaction.user,
      count: selected,
      channelName: interaction.channel.name,
    });

    await interaction.reply({
      content: `${selected}人受注を記録しました。`,
      ephemeral: true,
    });
  },
};
