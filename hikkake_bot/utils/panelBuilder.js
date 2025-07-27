// utils/panelBuilder.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildPanelEmbed(type, counts = {}) {
  const getSafe = (obj, key, suffix = '') => obj?.[key] != null ? `${obj[key]}${suffix}` : `0${suffix}`;

  if (type === 'order') {
    return new EmbedBuilder()
      .setTitle('🪤 受注状況パネル')
      .setDescription(
        `【クエスト】\n` +
        `@${counts.quest?.user || '未設定'}\n` +
        `組：${getSafe(counts.quest, 'group', '組')}　人数：${getSafe(counts.quest, 'member', '人')}　本数：${getSafe(counts.quest, 'count', '本')}　プラ：-${getSafe(counts.quest, 'cast', '人')}\n\n` +

        `【凸スナ】\n` +
        `@${counts.tosu?.user || '未設定'}\n` +
        `組：${getSafe(counts.tosu, 'group', '組')}　人数：${getSafe(counts.tosu, 'member', '人')}　本数：${getSafe(counts.tosu, 'count', '本')}　プラ：-${getSafe(counts.tosu, 'cast', '人')}\n\n` +

        `【トロイの木馬】\n` +
        `@${counts.horse?.user || '未設定'}\n` +
        `組：${getSafe(counts.horse, 'group', '組')}　人数：${getSafe(counts.horse, 'member', '人')}　本数：${getSafe(counts.horse, 'count', '本')}　プラ：-${getSafe(counts.horse, 'cast', '人')}`
      )
      .setColor(0x00cc99)
      .setTimestamp();
  }

  // 店内状況パネル
  return new EmbedBuilder()
    .setTitle('🪤 店内状況パネル')
    .setDescription(
      `【クエスト】 　　　【凸スナ】 　　 【トロイの木馬】\n` +
      `プラ：${getSafe(counts.quest, 'pura', '人')}　　` +
      `プラ：${getSafe(counts.tosu, 'pura', '人')}　　` +
      `プラ：${getSafe(counts.horse, 'pura', '人')}\n` +
      `カマ：${getSafe(counts.quest, 'kama', '人')}　　` +
      `カマ：${getSafe(counts.tosu, 'kama', '人')}　　` +
      `カマ：${getSafe(counts.horse, 'kama', '人')}`
    )
    .setColor(0x0099ff)
    .setTimestamp();
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
