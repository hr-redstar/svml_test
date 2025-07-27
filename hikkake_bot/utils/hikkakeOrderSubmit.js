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

      const counts = state.counts?.[key] || { pura: 0, kama: 0, casual: 0 };
      const orderCount = state.orders?.[key] ?? 0;

      // buildPanelEmbed の引数は { plakama: プラ+カマ合計, flat: casual人数, order: 受注人数 }
      const embed = buildPanelEmbed(key, {
        plakama: (counts.pura ?? 0) + (counts.kama ?? 0),
        flat: counts.casual ?? 0,
        order: orderCount,
      });

      const buttons = buildPanelButtons(key);
      await msg.edit({ embeds: [embed], components: buttons });
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
    const orderCountInput = interaction.fields.getTextInputValue('order_count');
    const orderCount = parseInt(orderCountInput, 10);

    if (isNaN(orderCount) || orderCount < 0) {
      return interaction.editReply({ content: '受注人数は0以上の半角数字で入力してください。' });
    }

    const guildId = interaction.guildId;
    const state = await readState(guildId);

    if (!state.counts) state.counts = {};
    if (!state.counts[type]) {
      return interaction.editReply({ content: '対象のデータが見つかりません。' });
    }
    if (!state.orders) state.orders = {};
    if (typeof state.orders[type] !== 'number') state.orders[type] = 0;

    const targetCounts = state.counts[type];

    // プラから優先的に減算し、足りなければカマから減算
    const orderedFromPura = Math.min(orderCount, targetCounts.pura);
    const remainingOrder = orderCount - orderedFromPura;
    const orderedFromKama = Math.min(remainingOrder, targetCounts.kama);

    targetCounts.pura -= orderedFromPura;
    targetCounts.kama -= orderedFromKama;

    const totalOrdered = orderedFromPura + orderedFromKama;
    const notFulfilled = orderCount - totalOrdered;

    // 受注人数は state.orders に加算
    state.orders[type] += totalOrdered;

    await writeState(guildId, state);
    await updateAllPanels(interaction, state);

    try {
      await logToThread(guildId, type, interaction.client, {
        user: interaction.user,
        logType: '受注',
        details: { requested: orderCount, fulfilled: totalOrdered },
        channelName: interaction.channel.name,
      });
    } catch (e) {
      console.warn('[hikkakeOrderSubmit] ログ出力失敗', e);
    }

    let replyMessage = `【${type.toUpperCase()}】から ${totalOrdered}人 を受注しました。`;
    if (notFulfilled > 0) {
      replyMessage += ` (${notFulfilled}人分は不足していました。)`;
    }
    await interaction.editReply({ content: replyMessage });
  }
};
