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

      const typeLabel = {
        quest: 'クエスト',
        tosu: '凸スナ',
        horse: 'トロイの木馬',
      }[type] || type.toUpperCase();

      const state = await readState(guildId);

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
        content: `【${typeLabel}】プラカマ人数を選択してください。`,
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
