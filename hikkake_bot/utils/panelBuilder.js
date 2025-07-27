// utils/panelBuilder.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Builds one of the two panel embeds.
 * @param {'status' | 'orders'} panelType - The type of panel to build.
 * @param {'quest' | 'tosu' | 'horse'} hikkakeType - The category.
 * @param {object} state - The current state object.
 * @returns {EmbedBuilder}
 */
function buildPanelEmbed(panelType, hikkakeType, state) {
  const staff = state.staff?.[hikkakeType] || { pura: 0, kama: 0 };
  const orders = state.orders?.[hikkakeType] || [];

  if (panelType === 'status') {
    // Calculate available staff by subtracting staff allocated to orders
    const allocatedPura = orders.reduce((sum, order) => sum + (order.castPura || 0), 0);
    const allocatedKama = orders.reduce((sum, order) => sum + (order.castKama || 0), 0);

    const availablePura = (staff.pura || 0) - allocatedPura;
    const availableKama = (staff.kama || 0) - allocatedKama;

    return new EmbedBuilder()
      .setTitle(`■ 店内状況 (${hikkakeType.toUpperCase()})`)
      .addFields(
        { name: 'プラ', value: `${availablePura}人 (基本: ${staff.pura})`, inline: true },
        { name: 'カマ', value: `${availableKama}人 (基本: ${staff.kama})`, inline: true }
      )
      .setColor(0x0099ff)
      .setTimestamp();
  }

  if (panelType === 'orders') {
    const embed = new EmbedBuilder()
      .setTitle(`■ 受注一覧 (${hikkakeType.toUpperCase()})`)
      .setColor(0x00cc99)
      .setTimestamp();

    if (orders.length === 0) {
      embed.setDescription('現在、受注はありません。');
    } else {
      const description = orders.map(order => {
        const typeLabel = order.type === 'order' ? '受注' : 'ふらっと来た';
        const castPura = order.castPura || 0;
        const castKama = order.castKama || 0;
        const totalCast = castPura + castKama;
        return `**${typeLabel}** | 人数: ${order.people}人 | 本数: ${order.bottles}本 | キャスト: -${totalCast}人 (プ:${castPura}/カ:${castKama})`;
      }).join('\n');
      embed.setDescription(description);
    }
    return embed;
  }

  // Fallback for unknown type
  return new EmbedBuilder().setTitle('エラー').setDescription('不明なパネルタイプです。');
}

function buildPanelButtons(type) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_plakama`)
      .setLabel('プラカマ')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_order`)
      .setLabel('受注')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_casual`)
      .setLabel('ふらっと来た')
      .setStyle(ButtonStyle.Secondary)
  );
  return [row];
}

module.exports = {
  buildPanelEmbed,
  buildPanelButtons,
};
