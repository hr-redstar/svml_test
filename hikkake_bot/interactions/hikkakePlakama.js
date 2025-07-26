// interactions/hikkakePlakama.js

const { StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { readState, writeState } = require('../utils/hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_plakama$/,
  async handle(interaction) {
    const type = interaction.customId.split('_')[1];
    const guildId = interaction.guildId;

    // 選択リスト作成
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`hikkake_${type}_plakama_select`)
      .setPlaceholder('人数を選択してください（1〜25）')
      .addOptions(
        Array.from({ length: 25 }, (_, i) => (
          new StringSelectMenuOptionBuilder()
            .setLabel(`${i + 1}人`)
            .setValue(`${i + 1}`)
        ))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({ content: `プラカマ人数を選択してください。`, components: [row], ephemeral: true });
  }
};
