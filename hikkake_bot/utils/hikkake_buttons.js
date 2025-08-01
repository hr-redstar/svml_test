// hikkake_bot/utils/hikkake_buttons.js

const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const ranges = {
  purakama: [1, 25, '人'],    // 「人数」→「人」
  juchu: [1, 25, '人'],       // 0人は選択肢から除外（1〜25人）
  furatto: [1, 25, '人'],
};

function createSelectOptions(min, max, labelSuffix) {
  const options = [];
  for (let i = min; i <= max; i++) {
    options.push({
      label: `${i}${labelSuffix}`,
      value: i.toString(),
    });
  }
  return options;
}

function createSelect(type, item) {
  const [min, max, labelSuffix] = ranges[item];

  // type → 表示用の日本語名マッピング
  const typeLabelMap = {
    quest: 'クエスト',
    tosu: '凸スナ',
    horse: 'トロイの木馬',
  };
  const itemLabelMap = {
    purakama: 'プラカマ人数',
    juchu: '受注人数',
    furatto: 'ふらっと来た人数',
  };

  const placeholder = `${typeLabelMap[type] || type}の${itemLabelMap[item] || item}を選択してください`;

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`hikkake_${type}_${item}_select`)
      .setPlaceholder(placeholder)
      .addOptions(createSelectOptions(min, max, labelSuffix))
  );
}

module.exports = {
  createQuestPurakamaSelect: () => createSelect('quest', 'purakama'),
  createQuestJuchuSelect: () => createSelect('quest', 'juchu'),
  createQuestFurattoSelect: () => createSelect('quest', 'furatto'),

  createTosuPurakamaSelect: () => createSelect('tosu', 'purakama'),
  createTosuJuchuSelect: () => createSelect('tosu', 'juchu'),
  createTosuFurattoSelect: () => createSelect('tosu', 'furatto'),

  createHorsePurakamaSelect: () => createSelect('horse', 'purakama'),
  createHorseJuchuSelect: () => createSelect('horse', 'juchu'),
  createHorseFurattoSelect: () => createSelect('horse', 'furatto'),
};
