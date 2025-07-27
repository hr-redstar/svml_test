// hikkake_bot/utils/hikkake_button_handler.js
const { StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

/**
 * セレクトメニューを含むActionRowを生成する
 * @param {string} customId
 * @param {string} placeholder
 * @param {import('discord.js').StringSelectMenuOptionBuilder[]} options
 * @returns {ActionRowBuilder<StringSelectMenuBuilder>}
 */
function createSelectMenuRow(customId, placeholder, options) {
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .addOptions(options);
  return new ActionRowBuilder().addComponents(selectMenu);
}

/**
 * 数値の選択肢を生成する
 * @param {number} count
 * @param {string} unit
 * @param {number} start
 * @returns {StringSelectMenuOptionBuilder[]}
 */
function createNumericOptions(count, unit, start = 1) {
    return Array.from({ length: count }, (_, i) => {
        const value = i + start;
        return new StringSelectMenuOptionBuilder()
            .setLabel(`${value}${unit}`)
            .setValue(String(value));
    });
}

module.exports = {
  /**
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return false;

    const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_(plakama|order|casual)$/);
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
        // 受注では0人も選択可能にする
        row = createSelectMenuRow(`hikkake_order_step1_${type}`, '担当プラの人数を選択 (0-25)', createNumericOptions(26, '人', 0));
      } else if (action === 'casual') {
        content = `【${type.toUpperCase()}】ふらっと来た: まず追加するプラの人数を選択してください。`;
        row = createSelectMenuRow(`hikkake_casual_step1_${type}`, '追加プラの人数を選択 (1-25)', createNumericOptions(25, '人'));
      }

      if (row && content) {
        await interaction.reply({
          content,
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
