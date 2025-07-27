// hikkake_bot/interactions/hikkakeReactModal.js

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  customId: /^react_count_select_(quest|tosu|horse)_(num|count)$/,
  async handle(interaction) {
    try {
      const [, type, target] = interaction.customId.match(/^react_count_select_(quest|tosu|horse)_(num|count)$/);
      const selectedValue = interaction.values[0];

      const modal = new ModalBuilder()
        .setCustomId(`react_modal_${type}_${target}_${selectedValue}`)
        .setTitle(`${selectedValue}${target === 'num' ? '人' : '本'}の反応文を設定`);

      const input = new TextInputBuilder()
        .setCustomId('react_text')
        .setLabel('反応する文章（カンマ , で区切る）')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      await interaction.showModal(modal);
    } catch (error) {
      console.error('[hikkakeReactModal] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'モーダル表示中にエラーが発生しました。', ephemeral: true });
      }
    }
  },
};
