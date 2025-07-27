// interactions/hikkakePlakamaSelect.js
const { readState, writeState } = require('../utils/hikkakeStateManager');
const { updateAllHikkakePanels } = require('../utils/hikkakePanelManager');
const { InteractionResponseFlags } = require('discord.js');

module.exports = {
  // 対応するカスタムIDの正規表現
  customId: /^hikkake_(quest|tosu|horse)_plakama_(pura|kama)_select$/,

  async handle(interaction) {
    try {
      // customId解析
      const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_plakama_(pura|kama)_select$/);
      if (!match) {
        return interaction.reply({
          content: '不正な操作です。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
      const [, type, target] = match;

      // 選択値の存在チェック
      if (!interaction.values || !interaction.values[0]) {
        return interaction.reply({
          content: '人数を選択してください。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }

      // 選択値を数値化し範囲チェック
      const count = parseInt(interaction.values[0], 10);
      if (isNaN(count) || count < 0) {
        return interaction.reply({
          content: '有効な人数を選択してください。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }

      const guildId = interaction.guildId;

      // 状態取得・初期化
      const state = await readState(guildId);
      if (!state.counts) state.counts = {};
      if (!state.counts[type]) {
        state.counts[type] = { pura: 0, kama: 0, casual: 0 };
      }

      // 更新
      state.counts[type][target] = count;
      await writeState(guildId, state);

      // すべてのパネルを更新（状態に基づき）
      await updateAllHikkakePanels(interaction.client, guildId, state);

      const label = target === 'pura' ? 'プラ' : 'カマ';

      // 応答
      await interaction.reply({
        content: `🟢 **${type.toUpperCase()}** の ${label} 人数を **${count}人** に更新しました。`,
        flags: InteractionResponseFlags.Ephemeral,
      });

    } catch (error) {
      console.error('[hikkakePlakamaSelect] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '⚠️ 処理中にエラーが発生しました。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  },
};
