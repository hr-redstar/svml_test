// hikkake_bot/commands/hikkakeSettings.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ひっかけ設定')
    .setDescription('ひっかけボットの反応文などを設定します。')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('hikkake_open_settings_modal')
          .setLabel('反応文設定を開く')
          .setStyle(ButtonStyle.Primary),
      );

    await interaction.reply({
      content: 'ひっかけボットの設定メニューです。',
      components: [row],
      ephemeral: true,
    });
  },
};