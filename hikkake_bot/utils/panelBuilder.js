// utils/panelBuilder.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

function buildPanelEmbed(type, counts = { pura: 0, kama: 0 }) {
  const titleMap = {
    quest: 'クエスト一覧',
    tosu: '凸スナ一覧',
    horse: 'トロイの木馬一覧'
  };

  return new EmbedBuilder()
    .setTitle(`🪤 ${titleMap[type] || '一覧'}`)
    .setDescription(`プラ：${counts.pura}人\nカマ：${counts.kama}人`)
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
