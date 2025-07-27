// interactions/hikkakePlakama.js

const { StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { readState, writeState } = require('../utils/hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_plakama$/,
  async handle(interaction) {
    try {
      const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_plakama$/);
      if (!match) return;
      const type = match[1];
      const guildId = interaction.guildId;
      const channelId = interaction.channelId;

      const state = await readState(guildId);

      // パネル用の状態がなければ初期化（panelMessages、countsなどは別途管理）
      if (!state.counts) state.counts = {};
      if (!state.counts[type]) {
        state.counts[type] = { pura: 0, kama: 0, casual: 0 };
      }
      if (!state[type]) state[type] = {};
      if (!state[type][channelId]) {
        state[type][channelId] = {
          pura: 0,
          kama: 0,
          orders: [],
          messageId: null,
        };
      }

      // プラカマはpura + kama で設定できる想定なので、
      // 実際の選択はプラかカマどちらかを選べないなら、ここは人数の合計として扱う。

      // 今回は「プラカマ人数選択」なので単一人数選択のUI提供。数値は1~25。

      // 選択メニュー生成
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`hikkake_${type}_plakama_select`)
        .setPlaceholder('人数を選択してください（1〜25）')
        .addOptions(
          Array.from({ length: 25 }, (_, i) => 
            new StringSelectMenuOptionBuilder()
              .setLabel(`${i + 1}人`)
              .setValue(`${i + 1}`)
          )
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: `【${type.toUpperCase()}】プラカマ人数を選択してください。`,
        components: [row],
        ephemeral: true,
      });

    } catch (error) {
      console.error('[hikkakePlakama] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '処理中にエラーが発生しました。', ephemeral: true });
      }
    }
  },
};
