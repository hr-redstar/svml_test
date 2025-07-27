// interactions/hikkakeOrder.js

const {
  StringSelectMenuBuilder,
  ActionRowBuilder,
  StringSelectMenuOptionBuilder,
  InteractionResponseFlags,
} = require('discord.js');

function createOptions(count, labelSuffix = '人', valueOffset = 0, labelPrefix = '') {
  return Array.from({ length: count }, (_, i) =>
    new StringSelectMenuOptionBuilder()
      .setLabel(`${labelPrefix}${i + valueOffset}${labelSuffix}`)
      .setValue(`${i + valueOffset}`)
  );
}

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_order$/,
  async handle(interaction) {
    try {
      const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_order$/);
      if (!match) return;

      const type = match[1]; // quest / tosu / horse

      // メニュー作成
      const personMenu = new StringSelectMenuBuilder()
        .setCustomId(`hikkake_${type}_order_person`)
        .setPlaceholder('受注人数を選択（1〜25）')
        .addOptions(createOptions(25, '人', 1));

      const countMenu = new StringSelectMenuBuilder()
        .setCustomId(`hikkake_${type}_order_count`)
        .setPlaceholder('受注本数を選択（0〜10）')
        .addOptions(createOptions(11, '本', 0));

      const castMenu = new StringSelectMenuBuilder()
        .setCustomId(`hikkake_${type}_order_cast`)
        .setPlaceholder('キャスト予定人数（-人）')
        .addOptions(createOptions(26, '人', 0, '-'));

      const rows = [
        new ActionRowBuilder().addComponents(personMenu),
        new ActionRowBuilder().addComponents(countMenu),
        new ActionRowBuilder().addComponents(castMenu),
      ];

      await interaction.reply({
        content: '📝 受注内容を選んでください。',
        components: rows,
        flags: InteractionResponseFlags.Ephemeral,
      });

    } catch (error) {
      console.error('[hikkakeOrder] 受注メニュー表示エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⚠️ エラーが発生しました。もう一度お試しください。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  },
};
