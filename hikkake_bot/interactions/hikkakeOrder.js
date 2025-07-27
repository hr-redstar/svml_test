// interactions/hikkakeOrder.js
const { StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_order$/,
  async handle(interaction) {
    try {
      // 正規表現のキャプチャでtype取得
      const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_order$/);
      if (!match) return; // 万一の安全対策
      const type = match[1];

      const options = Array.from({ length: 25 }, (_, i) => 
        new StringSelectMenuOptionBuilder()
          .setLabel(`${i}人`)
          .setValue(i.toString())
      );

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`hikkake_${type}_order_select`)
        .setPlaceholder('受注する人数を選択（0〜24）')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: `受注する人数を選んでください。`,
        components: [row],
        ephemeral: true,
      });
    } catch (error) {
      console.error('[hikkakeOrder] 受注メニュー表示エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
      }
    }
  },
};
