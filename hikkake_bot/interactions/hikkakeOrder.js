// interactions/hikkakeOrder.js
const { StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_order$/,
  async handle(interaction) {
    try {
      const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_order$/);
      if (!match) return;
      const type = match[1];

      const options = Array.from({ length: 25 }, (_, i) => 
        new StringSelectMenuOptionBuilder()
          .setLabel(`${i + 1}人`)
          .setValue((i + 1).toString())
      );

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`hikkake_${type}_order_select`)
        .setPlaceholder('受注する人数を選択（1〜25）')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: `受注する人数を選んでください。`,
        components: [row],
        ephemeral: true,
      });
    } catch (error) {
      console.error('[hikkakeOrder] 受注メニュー表示エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
      }
    }
  },
};
