// hikkake_bot/utils/hikkake_buttons.js

const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const createSelectOptions = (min, max, labelPrefix) => {
  const options = [];
  for (let i = min; i <= max; i++) {
    options.push({
      label: `${labelPrefix} ${i}`,
      value: i.toString(),
    });
  }
  return options;
};

module.exports = {
  /**
   * クエスト用プラカマボタン（1～25）
   */
  createQuestPurakamaSelect() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('hikkake_quest_purakama_select')
        .setPlaceholder('クエストプラカマ人数を選択')
        .addOptions(createSelectOptions(1, 25, '人数'))
    );
  },

  /**
   * クエスト用受注ボタン（0～24本）
   */
  createQuestJuchuSelect() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('hikkake_quest_juchu_select')
        .setPlaceholder('クエスト受注本数を選択')
        .addOptions(createSelectOptions(0, 24, '本数'))
    );
  },

  /**
   * クエスト用ふらっと来ちゃったボタン（1～25）
   */
  createQuestFurattoSelect() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('hikkake_quest_furatto_select')
        .setPlaceholder('クエストふらっと人数を選択')
        .addOptions(createSelectOptions(1, 25, '人数'))
    );
  },

  // 同様に凸スナ用、トロイの木馬用も必要なら同じパターンで作成
  createTosuPurakamaSelect() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('hikkake_tosu_purakama_select')
        .setPlaceholder('凸スナプラカマ人数を選択')
        .addOptions(createSelectOptions(1, 25, '人数'))
    );
  },

  createTosuJuchuSelect() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('hikkake_tosu_juchu_select')
        .setPlaceholder('凸スナ受注本数を選択')
        .addOptions(createSelectOptions(0, 24, '本数'))
    );
  },

  createTosuFurattoSelect() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('hikkake_tosu_furatto_select')
        .setPlaceholder('凸スナふらっと人数を選択')
        .addOptions(createSelectOptions(1, 25, '人数'))
    );
  },

  createHorsePurakamaSelect() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('hikkake_horse_purakama_select')
        .setPlaceholder('トロイの木馬プラカマ人数を選択')
        .addOptions(createSelectOptions(1, 25, '人数'))
    );
  },

  createHorseJuchuSelect() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('hikkake_horse_juchu_select')
        .setPlaceholder('トロイの木馬受注本数を選択')
        .addOptions(createSelectOptions(0, 24, '本数'))
    );
  },

  createHorseFurattoSelect() {
    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('hikkake_horse_furatto_select')
        .setPlaceholder('トロイの木馬ふらっと人数を選択')
        .addOptions(createSelectOptions(1, 25, '人数'))
    );
  },
};
