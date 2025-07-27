// hikkake_bot/utils/hikkake_buttons.js

const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const ranges = {
  purakama: [1, 25, '人数'],
  juchu: [0, 24, '本数'],
  furatto: [1, 25, '人数'],
};

function createSelectOptions(min, max, labelPrefix) {
  const options = [];
  for (let i = min; i <= max; i++) {
    options.push({
      label: `${labelPrefix} ${i}`,
      value: i.toString(),
    });
  }
  return options;
}

function createSelect(type, item) {
  const [min, max, labelPrefix] = ranges[item];
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`hikkake_${type}_${item}_select`)
      .setPlaceholder(`${type}の${item}を選択`)
      .addOptions(createSelectOptions(min, max, labelPrefix))
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
