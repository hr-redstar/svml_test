// interactions/hikkakePlakamaSelect.js

const { readState, writeState } = require('../utils/hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');
const { updateAllHikkakePanels } = require('../utils/hikkakePanelManager');
const { InteractionResponseFlags } = require('discord.js');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_plakama_(pura|kama)_select$/,
  async handle(interaction) {
    try {
      const [, type, target] = interaction.customId.match(/^hikkake_(quest|tosu|horse)_plakama_(pura|kama)_select$/);
      const selectedValue = interaction.values[0];
      const count = parseInt(selectedValue, 10);
      if (isNaN(count)) {
        return interaction.reply({ content: '正しい人数を選択してください。', flags: InteractionResponseFlags.Ephemeral });
      }

      const guildId = interaction.guildId;
      const state = await readState(guildId);
      if (!state.counts) state.counts = {};
      if (!state.counts[type]) state.counts[type] = { pura: 0, kama: 0, casual: 0 };

      state.counts[type][target] = count;
      await writeState(guildId, state);

      // 全パネルのEmbed更新（state.countsに基づいて）
      await updateAllHikkakePanels(interaction.client, guildId, state);

      await interaction.reply({
        content: `【${type.toUpperCase()}】${target === 'pura' ? 'プラ' : 'カマ'}人数を ${count}人 に更新しました。`,
        flags: InteractionResponseFlags.Ephemeral,
      });
    } catch (error) {
      console.error('[hikkakePlakamaSelect] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '処理中にエラーが発生しました。', flags: InteractionResponseFlags.Ephemeral });
      }
    }
  },
};
