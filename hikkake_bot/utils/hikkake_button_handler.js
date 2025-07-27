// hikkake_bot/utils/hikkake_button_handler.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { createSelectMenuRow, createNumericOptions } = require('./discordUtils');

module.exports = {
  /**
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return false;

    // --- New handler for settings button ---
    if (interaction.customId === 'hikkake_open_settings_modal') {
      try {
        // This modal is for text input, which aligns with your design preference.
        const modal = new ModalBuilder()
          .setCustomId('hikkake_settings_submit')
          .setTitle('ひっかけボット 反応文設定');

        const responseTextInput = new TextInputBuilder()
          .setCustomId('response_text_input')
          .setLabel('新しい反応文を入力')
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('例: {user}さんが{count}人受注しました！')
          .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(responseTextInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
        return true;
      } catch (error) {
        console.error('[hikkake_button_handler] 設定モーダル表示エラー:', error);
        // The global error handler in index.js will handle the reply.
        throw error;
      }
    }
    // --- End of new handler ---

    const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_(plakama|order|leave|arrival)$/);
    if (!match) return false;

    const [, type, action] = match;

    try {
      let row, content;

      // すべてのアクションは「プラ」の人数選択から開始
      if (action === 'plakama') {
        content = `【${type.toUpperCase()}】プラカマ設定: まずプラの人数を選択してください。`;
        row = createSelectMenuRow(`hikkake_plakama_step1_${type}`, 'プラの人数を選択 (1-25)', createNumericOptions(25, '人'));
      } else if (action === 'order') {
        content = `【${type.toUpperCase()}】受注: まず担当したプラの人数を選択してください。`;
        // BUG FIX: The number of options cannot exceed 25. Range 0-24 gives 25 options.
        row = createSelectMenuRow(`hikkake_order_step1_${type}`, '担当プラの人数を選択 (0-24)', createNumericOptions(25, '人', 0));
      } else if (action === 'leave') {
        content = `【${type.toUpperCase()}】退店処理: まず退店したプラの人数を選択してください。`;
        row = createSelectMenuRow(`hikkake_leave_step1_${type}`, '退店プラの人数を選択 (0-24)', createNumericOptions(25, '人', 0));
      } else if (action === 'arrival') {
        content = `【${type.toUpperCase()}】ふらっと来た: まず追加するプラの人数を選択してください。`;
        row = createSelectMenuRow(`hikkake_arrival_step1_${type}`, '追加プラの人数を選択 (0-24)', createNumericOptions(25, '人', 0));
      }

      if (row && content) {
        await interaction.reply({
          content,
          components: [row],
          flags: 64, // 64 is MessageFlags.Ephemeral
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
