// utils/panelBuilder.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildPanelEmbed(type, counts = {}) {
  const titleMap = {
    quest: 'クエスト一覧',
    tosu: '凸スナ一覧',
    horse: 'トロイの木馬一覧',
    order: '受注状況一覧'
  };

  if (type === 'order') {
    return new EmbedBuilder()
      .setTitle(`📂 受注一覧`)
      .setDescription(
        `【クエスト受注】\n` +
        `**受注**　組数：${counts.quest?.group || 0}組 / 人数：${counts.quest?.member || 0}人　本数：${counts.quest?.count || 0}本　キャスト予定人数 -${counts.quest?.cast || 0}（リスト選択1~25）\n\n` +

        `【凸スナ受注】\n` +
        `**ふらっと来た**　組数：${counts.tosu?.group || 0}組 / 人数：${counts.tosu?.member || 0}人　本数：${counts.tosu?.count || 0}本　キャスト予定人数 -${counts.tosu?.cast || 0}（リスト選択1~25）\n\n` +

        `【トロイの木馬受注】\n` +
        `**受注**　組数：${counts.horse?.group || 0}組 / 人数：${counts.horse?.member || 0}人　本数：${counts.horse?.count || 0}本　キャスト予定人数 -${counts.horse?.cast || 0}（リスト選択1~25）`
      )
      .setColor(0x00cc99)
      .setTimestamp();
  }

  // 通常のクエスト・凸スナ・トロイ
  return new EmbedBuilder()
    .setTitle(`🪤 ${titleMap[type] || '一覧'}`)
    .setDescription(`プラ：${counts.pura || 0}人\nカマ：${counts.kama || 0}人\nふらっと来た：${counts.casual || 0}人`)
    .setColor(0x0099ff)
    .setTimestamp();
}

function buildPanelButtons(type) {
  return new ActionRowBuilder().addComponents(
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
}

module.exports = {
  buildPanelEmbed,
  buildPanelButtons
};
