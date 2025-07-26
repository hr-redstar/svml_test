// interactions/hikkakeOrder.js

const { StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_order$/,
  async handle(interaction) {
    const type = interaction.customId.split('_')[1];

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`hikkake_${type}_order_select`)
      .setPlaceholder('受注する人数を選択（0〜24）')
      .addOptions(
        Array.from({ length: 25 }, (_, i) => (
          new StringSelectMenuOptionBuilder()
            .setLabel(`${i}人`)
            .setValue(`${i}`)
        ))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: `受注する人数を選んでください。`,
      components: [row],
      ephemeral: true,
    });
  },
};
