// utils/panelBuilder.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function buildPanelEmbed(type, counts = {}) {
  const titleMap = {
    quest: 'クエスト一覧',
    tosu: '凸スナ一覧',
    horse: 'トロイの木馬一覧',
    order: '受注状況一覧',
  };

  if (type === 'order') {
    return new EmbedBuilder()
      .setTitle('■ 受注一覧')
      .setDescription(`
【クエスト受注】
受注　組数：${counts.quest?.group || 0}組 / 人数：${counts.quest?.member || 0}人　本数${counts.quest?.count || 0}本　キャスト予定人数 -${counts.quest?.cast || 0}(リスト選択1~25)

【凸スナ受注】
ふらっと来た　組数：${counts.tosu?.group || 0}組 / 人数：${counts.tosu?.member || 0}人　本数${counts.tosu?.count || 0}本　キャスト予定人数 -${counts.tosu?.cast || 0}(リスト選択1~25)

【トロイの木馬受注】
受注　組数：${counts.horse?.group || 0}組 / 人数：${counts.horse?.member || 0}人　本数${counts.horse?.count || 0}本　キャスト予定人数 -${counts.horse?.cast || 0}(リスト選択1~25)
`)
      .setColor(0x00cc99)
      .setTimestamp();
  }

  // 店内状況
  return new EmbedBuilder()
    .setTitle('■店内状況')
    .setDescription(
      `【クエスト】\nプラ　${counts.pura || 0}　カマ　${counts.kama || 0}\n` +
      `【凸スナ】\nプラ　${counts.pura || 0}　カマ　${counts.kama || 0}\n` +
      `【トロイの木馬】\nプラ　${counts.pura || 0}　カマ　${counts.kama || 0}`
    )
    .setColor(0x0099ff)
    .setTimestamp();
}

function buildPanelButtons(type) {
  const row = new ActionRowBuilder().addComponents(
    // プラカマボタン（リスト選択・プラカマ入力）
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_plakama_input`)
      .setLabel('リスト選択 プラカマ入力')
      .setStyle(ButtonStyle.Primary),
    // 受注ボタン（プラカマ本数入力）
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_order_input`)
      .setLabel('受注 プラカマ本数入力')
      .setStyle(ButtonStyle.Success),
    // ふらっと来たボタン（プラカマ入力）
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_casual_input`)
      .setLabel('ふらっと来た プラカマ入力')
      .setStyle(ButtonStyle.Secondary)
  );

  return [row];
}

module.exports = {
  buildPanelEmbed,
  buildPanelButtons,
};
