// hikkake_bot/utils/hikkake_button_handler.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
  /**
   * ボタン押下ハンドラ
   * @param {import('discord.js').ButtonInteraction} interaction
   * @returns {Promise<boolean>} 処理したらtrue、未処理ならfalse
   */
  async execute(interaction) {
    if (!interaction.isButton()) return false;

    const customId = interaction.customId;

    try {
      // プラカマボタン
      let match = customId.match(/^hikkake_(quest|tosu|horse)_plakama$/);
      if (match) {
        const type = match[1];
        const options = Array.from({ length: 25 }, (_, i) => ({
          label: `${i + 1}人`,
          value: `${i + 1}`,
        }));
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`hikkake_${type}_plakama_select`)
          .setPlaceholder('プラカマ人数を選択してください（1〜25）')
          .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
          content: `【${type.toUpperCase()}】プラカマ人数を選んでください。`,
          components: [row],
          ephemeral: true,
        });
        return true;
      }

      // 受注ボタン
      match = customId.match(/^hikkake_(quest|tosu|horse)_order$/);
      if (match) {
        const type = match[1];
        const options = Array.from({ length: 25 }, (_, i) => ({
          label: `${i}人`,
          value: `${i}`,
        }));
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`hikkake_${type}_order_select`)
          .setPlaceholder('受注人数を選択してください（0〜24）')
          .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
          content: `【${type.toUpperCase()}】受注人数を選んでください。`,
          components: [row],
          ephemeral: true,
        });
        return true;
      }

      // ふらっと来たボタン
      match = customId.match(/^hikkake_(quest|tosu|horse)_casual$/);
      if (match) {
        const type = match[1];
        const options = Array.from({ length: 25 }, (_, i) => ({
          label: `${i + 1}人`,
          value: `${i + 1}`,
        }));
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`hikkake_${type}_casual_select`)
          .setPlaceholder('ふらっと来た人数を選択してください（1〜25）')
          .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
          content: `【${type.toUpperCase()}】ふらっと来た人数を選んでください。`,
          components: [row],
          ephemeral: true,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('[hikkake_button_handler] ボタン処理エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({ content: 'ボタン処理中にエラーが発生しました。', ephemeral: true });
        } catch (e) {
          console.error('[hikkake_button_handler] エラー返信失敗:', e);
        }
      }
      return true;
    }
  },
};
