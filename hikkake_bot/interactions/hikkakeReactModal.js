// hikkake_bot/interactions/hikkakeReactModal.js

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionResponseFlags,
} = require('discord.js');

module.exports = {
  customId: /^react_count_select_(quest|tosu|horse)_(num|count)$/,
  async handle(interaction) {
    try {
      const matched = interaction.customId.match(/^react_count_select_(quest|tosu|horse)_(num|count)$/);
      if (!matched) {
        return await interaction.reply({
          content: '不正な操作です。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
      const [, type, target] = matched;

      const selectedValue = interaction.values?.[0];
      if (!selectedValue) {
        return await interaction.reply({
          content: '選択された値が無効です。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }

      const unitLabel = target === 'num' ? '人' : '本';
      const modalTitle = `${selectedValue}${unitLabel}の反応文を設定`;

      const modal = new ModalBuilder()
        .setCustomId(`react_modal_${type}_${target}_${selectedValue}`)
        .setTitle(modalTitle);

      const input = new TextInputBuilder()
        .setCustomId('react_text')
        .setLabel('反応文（カンマ , 区切りで複数登録可能）')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));

      await interaction.showModal(modal);

    } catch (error) {
      console.error('[hikkakeReactModal] モーダル生成エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'モーダル表示中にエラーが発生しました。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  },
};
