// hikkake_bot/utils/hikkake_button_handler.js
const { StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

/**
 * 数値選択用のセレクトメニューコンポーネントを作成するヘルパー関数
 * @param {string} customId - セレクトメニューのカスタムID
 * @param {string} placeholder - プレースホルダーのテキスト
 * @param {number} start - 選択肢の開始番号
 * @param {number} end - 選択肢の終了番号
 * @param {string} labelSuffix - 選択肢ラベルの接尾辞 (例: '人', '本')
 * @returns {ActionRowBuilder<StringSelectMenuBuilder>}
 */
const createNumberSelectMenuRow = (customId, placeholder, start, end, labelSuffix) => {
  const options = Array.from({ length: end - start + 1 }, (_, i) => {
    const value = start + i;
    return new StringSelectMenuOptionBuilder()
      .setLabel(`${value}${labelSuffix}`)
      .setValue(value.toString());
  });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .addOptions(options);

  return new ActionRowBuilder().addComponents(selectMenu);
};

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
      const plakamaMatch = customId.match(/^hikkake_(quest|tosu|horse)_plakama$/);
      if (plakamaMatch) {
        const type = plakamaMatch[1];
        const row = createNumberSelectMenuRow(
          `hikkake_${type}_plakama_select`,
          'プラカマ人数を選択してください（1～25）',
          1, 25, '人'
        );
        await interaction.reply({
          content: `【${type.charAt(0).toUpperCase() + type.slice(1)}】のプラカマ人数を選択してください。`,
          components: [row],
          ephemeral: true,
        });
        return true;
      }

      // 受注ボタン
      const orderMatch = customId.match(/^hikkake_(quest|tosu|horse)_order$/);
      if (orderMatch) {
        const type = orderMatch[1];
        const row = createNumberSelectMenuRow(
          `hikkake_${type}_order_select`,
          '受注する人数を選択してください（0～24）',
          0, 24, '人'
        );
        await interaction.reply({
          content: `【${type.charAt(0).toUpperCase() + type.slice(1)}】の受注人数を選択してください。`,
          components: [row],
          ephemeral: true,
        });
        return true;
      }

      // ふらっと来たボタン (panelBuilder.jsの'casual'に合わせる)
      const casualMatch = customId.match(/^hikkake_(quest|tosu|horse)_casual$/);
      if (casualMatch) {
        const type = casualMatch[1];
        // 対応するSelectハンドラ(hikkakeFurattoSelect.js)のcustomIdに合わせる
        const row = createNumberSelectMenuRow(
          `hikkake_${type}_furatto_select`,
          'ふらっと来た人数を選択してください（1～25）',
          1, 25, '人'
        );
        await interaction.reply({ content: `【${type.charAt(0).toUpperCase() + type.slice(1)}】の「ふらっと来た」人数を選択してください。`, components: [row], ephemeral: true });
        return true;
      }

      return false;
    } catch (error) {
      console.error('[hikkake_button_handler] ボタン処理エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'ボタン処理中にエラーが発生しました。', ephemeral: true });
      }
      return true;
    }
  },
};
