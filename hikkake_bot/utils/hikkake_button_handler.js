// hikkake_bot/utils/hikkake_button_handler.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { readState } = require('./hikkakeStateManager');

module.exports = {
  /**
   * @param {import('discord.js').ButtonInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.isButton()) return false;

    const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_(plakama|order|casual)$/);
    if (!match) return false;

    const [, type, action] = match;
    const state = await readState(interaction.guildId);

    try {
      if (action === 'plakama') {
        const staff = state.staff?.[type] || { pura: 0, kama: 0 };
        const modal = new ModalBuilder().setCustomId(`hikkake_plakama_modal_${type}`).setTitle(`【${type.toUpperCase()}】基本スタッフ設定`);
        const puraInput = new TextInputBuilder().setCustomId('pura_count').setLabel('プラの基本人数').setStyle(TextInputStyle.Short).setValue(String(staff.pura));
        const kamaInput = new TextInputBuilder().setCustomId('kama_count').setLabel('カマの基本人数').setStyle(TextInputStyle.Short).setValue(String(staff.kama));
        modal.addComponents(new ActionRowBuilder().addComponents(puraInput), new ActionRowBuilder().addComponents(kamaInput));
        await interaction.showModal(modal);
        return true;
      }

      if (action === 'order') {
        const modal = new ModalBuilder().setCustomId(`hikkake_order_modal_${type}`).setTitle(`【${type.toUpperCase()}】受注内容入力`);
        const peopleInput = new TextInputBuilder().setCustomId('people_count').setLabel('受注した人数').setStyle(TextInputStyle.Short).setPlaceholder('例: 2').setRequired(true);
        const bottlesInput = new TextInputBuilder().setCustomId('bottles_count').setLabel('ボトルの本数').setStyle(TextInputStyle.Short).setPlaceholder('例: 1').setRequired(true);
        const castPuraInput = new TextInputBuilder().setCustomId('cast_pura_count').setLabel('担当したプラの人数').setStyle(TextInputStyle.Short).setPlaceholder('例: 1').setRequired(true);
        const castKamaInput = new TextInputBuilder().setCustomId('cast_kama_count').setLabel('担当したカマの人数').setStyle(TextInputStyle.Short).setPlaceholder('例: 0').setRequired(true);
        modal.addComponents(
          new ActionRowBuilder().addComponents(peopleInput),
          new ActionRowBuilder().addComponents(bottlesInput),
          new ActionRowBuilder().addComponents(castPuraInput),
          new ActionRowBuilder().addComponents(castKamaInput)
        );
        await interaction.showModal(modal);
        return true;
      }

      if (action === 'casual') {
        const modal = new ModalBuilder().setCustomId(`hikkake_casual_modal_${type}`).setTitle(`【${type.toUpperCase()}】ふらっと来たスタッフ追加`);
        const puraInput = new TextInputBuilder().setCustomId('pura_add_count').setLabel('追加するプラの人数').setStyle(TextInputStyle.Short).setPlaceholder('例: 1').setRequired(true);
        const kamaInput = new TextInputBuilder().setCustomId('kama_add_count').setLabel('追加するカマの人数').setStyle(TextInputStyle.Short).setPlaceholder('例: 0').setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(puraInput), new ActionRowBuilder().addComponents(kamaInput));
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
