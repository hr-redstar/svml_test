// hikkake_bot/utils/hikkake_button_handler.js
const { StringSelectMenuBuilder, ActionRowBuilder, MessageFlagsBitField } = require('discord.js');

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
        const puraOptions = Array.from({ length: 25 }, (_, i) => ({
          label: `プラ ${i + 1}人`,
          value: `pura_${i + 1}`,
        }));
        const kamaOptions = Array.from({ length: 25 }, (_, i) => ({
          label: `カマ ${i + 1}人`,
          value: `kama_${i + 1}`,
        }));

        const puraSelect = new StringSelectMenuBuilder()
          .setCustomId(`hikkake_${type}_plakama_pura_select`)
          .setPlaceholder('プラ人数を選択してください（1〜25）')
          .addOptions(puraOptions);

        const kamaSelect = new StringSelectMenuBuilder()
          .setCustomId(`hikkake_${type}_plakama_kama_select`)
          .setPlaceholder('カマ人数を選択してください（1〜25）')
          .addOptions(kamaOptions);

        const row1 = new ActionRowBuilder().addComponents(puraSelect);
        const row2 = new ActionRowBuilder().addComponents(kamaSelect);

        await interaction.reply({
          content: `【${type.toUpperCase()}】プラ・カマ人数を選んでください。`,
          components: [row1, row2],
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return true;
      }

      // 受注ボタン
      match = customId.match(/^hikkake_(quest|tosu|horse)_order$/);
      if (match) {
        const type = match[1];
        const puraOptions = Array.from({ length: 25 }, (_, i) => ({
          label: `プラ ${i + 1}人`,
          value: `pura_${i + 1}`,
        }));
        const kamaOptions = Array.from({ length: 25 }, (_, i) => ({
          label: `カマ ${i + 1}人`,
          value: `kama_${i + 1}`,
        }));
        const bottleOptions = Array.from({ length: 25 }, (_, i) => ({
          label: `本数 ${i + 1}`,
          value: `bottle_${i + 1}`,
        }));

        const puraSelect = new StringSelectMenuBuilder()
          .setCustomId(`hikkake_${type}_order_pura_select`)
          .setPlaceholder('プラ人数を選択してください（1〜25）')
          .addOptions(puraOptions);

        const kamaSelect = new StringSelectMenuBuilder()
          .setCustomId(`hikkake_${type}_order_kama_select`)
          .setPlaceholder('カマ人数を選択してください（1〜25）')
          .addOptions(kamaOptions);

        const bottleSelect = new StringSelectMenuBuilder()
          .setCustomId(`hikkake_${type}_order_bottle_select`)
          .setPlaceholder('本数(ボトル)を選択してください（1〜25）')
          .addOptions(bottleOptions);

        const row1 = new ActionRowBuilder().addComponents(puraSelect);
        const row2 = new ActionRowBuilder().addComponents(kamaSelect);
        const row3 = new ActionRowBuilder().addComponents(bottleSelect);

        await interaction.reply({
          content: `【${type.toUpperCase()}】プラ・カマ人数と本数(ボトル)を選んでください。`,
          components: [row1, row2, row3],
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return true;
      }

      // ふらっと来たボタン
      match = customId.match(/^hikkake_(quest|tosu|horse)_casual$/);
      if (match) {
        const type = match[1];
        const puraOptions = Array.from({ length: 25 }, (_, i) => ({
          label: `プラ ${i + 1}人`,
          value: `pura_${i + 1}`,
        }));
        const kamaOptions = Array.from({ length: 25 }, (_, i) => ({
          label: `カマ ${i + 1}人`,
          value: `kama_${i + 1}`,
        }));

        const puraSelect = new StringSelectMenuBuilder()
          .setCustomId(`hikkake_${type}_casual_pura_select`)
          .setPlaceholder('プラ人数を選択してください（1〜25）')
          .addOptions(puraOptions);

        const kamaSelect = new StringSelectMenuBuilder()
          .setCustomId(`hikkake_${type}_casual_kama_select`)
          .setPlaceholder('カマ人数を選択してください（1〜25）')
          .addOptions(kamaOptions);

        const row1 = new ActionRowBuilder().addComponents(puraSelect);
        const row2 = new ActionRowBuilder().addComponents(kamaSelect);

        await interaction.reply({
          content: `【${type.toUpperCase()}】ふらっと来た プラ・カマ人数を選んでください。`,
          components: [row1, row2],
          flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('[hikkake_button_handler] ボタン処理エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({
            content: 'ボタン処理中にエラーが発生しました。',
            flags: MessageFlagsBitField.Flags.Ephemeral,
          });
        } catch (e) {
          console.error('[hikkake_button_handler] エラー返信失敗:', e);
        }
      }
      return true;
    }
  },
};
