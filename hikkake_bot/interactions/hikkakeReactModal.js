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
      // customIdからtypeとtargetを抽出
      const [, type, target] = interaction.customId.match(/^react_count_select_(quest|tosu|horse)_(num|count)$/);
      const selectedValue = interaction.values[0];

      // モーダルタイトル用の単位文字列設定
      const unitLabel = target === 'num' ? '人' : '本';

      // モーダル構築
      const modal = new ModalBuilder()
        .setCustomId(`react_modal_${type}_${target}_${selectedValue}`)
        .setTitle(`${selectedValue}${unitLabel}の反応文を設定`);

      // テキスト入力欄の作成（段落形式、必須）
      const input = new TextInputBuilder()
        .setCustomId('react_text')
        .setLabel('反応する文章（カンマ , で区切って複数登録可）')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      // モーダル表示
      await interaction.showModal(modal);
    } catch (error) {
      console.error('[hikkakeReactModal] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'モーダル表示中にエラーが発生しました。', ephemeral: true });
      }
    }
  },
};
