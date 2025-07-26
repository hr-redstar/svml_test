// hikkake_bot/utils/hikkake_modals.js

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  /**
   * 反応文設定モーダル（複数文を「,」で区切って登録）
   * @param {string} customId 
   * @param {string} title 
   * @param {string} label 
   * @param {string} placeholder 
   * @param {string} defaultValue 
   */
  createReactionSettingModal(customId, title, label, placeholder, defaultValue = '') {
    const modal = new ModalBuilder()
      .setCustomId(customId)
      .setTitle(title);
    
    const input = new TextInputBuilder()
      .setCustomId('reactionTexts')
      .setLabel(label)
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder(placeholder)
      .setRequired(true)
      .setValue(defaultValue);

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
   * @param {string} defaultValue 
   */
  createNumberInputModal(customId, title, label, placeholder, defaultValue = '') {
    const modal = new ModalBuilder()
      .setCustomId(customId)
      .setTitle(title);

    const input = new TextInputBuilder()
      .setCustomId('numberInput')
      .setLabel(label)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(placeholder)
      .setRequired(true)
      .setValue(defaultValue);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);
    return modal;
  }
};
