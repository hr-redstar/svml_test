// hikkake_bot/utils/hikkake_button_handler.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { readState } = require('./hikkakeStateManager');

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
        const state = await readState(interaction.guildId);
        const counts = state.counts?.[type] ?? { pura: 0, kama: 0 };

        const modal = new ModalBuilder()
          .setCustomId(`hikkake_plakama_modal_${type}`)
          .setTitle(`【${type.toUpperCase()}】プラカマ人数設定`);

        const puraInput = new TextInputBuilder()
          .setCustomId('pura_count')
          .setLabel('プラの人数')
          .setStyle(TextInputStyle.Short)
          .setValue(String(counts.pura ?? 0))
          .setRequired(true);

        const kamaInput = new TextInputBuilder()
          .setCustomId('kama_count')
          .setLabel('カマの人数')
          .setStyle(TextInputStyle.Short)
          .setValue(String(counts.kama ?? 0))
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(puraInput),
          new ActionRowBuilder().addComponents(kamaInput)
        );

        await interaction.showModal(modal);
        return true;
      }

      // 受注ボタン
      match = customId.match(/^hikkake_(quest|tosu|horse)_order$/);
      if (match) {
        const type = match[1];
        const modal = new ModalBuilder()
          .setCustomId(`hikkake_order_modal_${type}`)
          .setTitle(`【${type.toUpperCase()}】受注人数入力`);

        const orderInput = new TextInputBuilder()
          .setCustomId('order_count')
          .setLabel('受注した人数')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('半角数字で入力')
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(orderInput));

        await interaction.showModal(modal);
        return true;
      }

      // ふらっと来たボタン
      match = customId.match(/^hikkake_(quest|tosu|horse)_casual$/);
      if (match) {
        const type = match[1];
        const state = await readState(interaction.guildId);
        const currentCasual = String(state.counts?.[type]?.casual ?? 0);

        const modal = new ModalBuilder()
          .setCustomId(`hikkake_casual_modal_${type}`)
          .setTitle(`【${type.toUpperCase()}】ふらっと来た人数`);

        const casualInput = new TextInputBuilder()
          .setCustomId('casual_count')
          .setLabel('ふらっと来た人数')
          .setStyle(TextInputStyle.Short)
          .setValue(currentCasual)
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(casualInput));
        await interaction.showModal(modal);
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
