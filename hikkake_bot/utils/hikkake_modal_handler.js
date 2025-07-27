// hikkake_bot/utils/hikkake_modal_handler.js

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  /**
   * 反応文設定モーダル（複数文を「,」で区切って登録）
   * @param {string} customId 
   * @param {string} title 
   * @param {string} label 
   * @param {string} placeholder 
   * @param {string} [defaultValue] 省略可、入力欄の初期値
   * @returns {ModalBuilder}
   *
   * 例:
   * createReactionSettingModal(
   *   'reaction_setting_quest_num1',
   *   'クエスト人数1の反応文設定',
   *   '反応文(複数はカンマ区切り)',
   *   'ありがとう！,助かる！',
   *   'ありがとう！'
   * );
   */
  createReactionSettingModal(customId, title, label, placeholder, defaultValue) {
    const modal = new ModalBuilder()
      .setCustomId(customId)
      .setTitle(title);
    
    const input = new TextInputBuilder()
      .setCustomId('reactionTexts')
      .setLabel(label)
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder(placeholder)
      .setRequired(true);
    
    if (defaultValue !== undefined) {
      input.setValue(defaultValue);
    }

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);
    return modal;
  },

  /**
   * 数字入力モーダル（人数や本数用）
   * @param {string} customId 
   * @param {string} title 
   * @param {string} label 
   * @param {string} placeholder 
   * @param {string} [defaultValue] 省略可、入力欄の初期値
   * @returns {ModalBuilder}
   *
   * 例:
   * createNumberInputModal(
   *   'number_input_quest_pura',
   *   'クエスト プラカマ人数入力',
   *   '人数を入力してください',
   *   '例: 5',
   *   '3'
   * );
   */
  createNumberInputModal(customId, title, label, placeholder, defaultValue) {
    const modal = new ModalBuilder()
      .setCustomId(customId)
      .setTitle(title);

    const input = new TextInputBuilder()
      .setCustomId('numberInput')
      .setLabel(label)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(placeholder)
      .setRequired(true);

    if (defaultValue !== undefined) {
      input.setValue(defaultValue);
    }

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);
    return modal;
  }
};
