// hikkake_bot/interactions/hikkakeReactSubmit.js

const { readJsonFromGCS, writeJsonToGCS } = require('../utils/gcs');
const { ModalSubmitInteraction } = require('discord.js');

module.exports = {
  customId: /^react_modal_(quest|tosu|horse)_(num|count)_(\d{1,2})$/,
  
  /**
   * @param {ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const customIdPattern = /^react_modal_(quest|tosu|horse)_(num|count)_(\d{1,2})$/;
    try {
      const match = interaction.customId.match(customIdPattern);
      if (!match) {
        return interaction.reply({ content: '無効なカスタムIDです。', ephemeral: true });
      }

      const [, type, target, numStr] = match;
      const num = parseInt(numStr, 10);
      const guildId = interaction.guildId;
      const filePath = `hikkake/${guildId}/reactions.json`;

      const rawText = interaction.fields.getTextInputValue('react_text');
      if (!rawText) {
        return interaction.reply({ content: 'テキストが空です。', ephemeral: true });
      }

      // テキスト整形・バリデーション
      const values = rawText
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      if (values.length === 0) {
        return interaction.reply({ content: '有効な反応文が1つもありません。', ephemeral: true });
      }

      // GCSから既存データ取得
      let data = {};
      try {
        data = await readJsonFromGCS(filePath);
        if (typeof data !== 'object' || Array.isArray(data)) throw new Error('不正なJSON形式');
      } catch (err) {
        console.warn(`[hikkakeReactSubmit] GCS読み込み失敗または初期化: ${filePath}`, err.message);
        data = {};
      }

      // 階層的にデータをセット
      data[type] ??= {};
      data[type][target] ??= {};
      data[type][target][num] = values;

      // GCSに保存
      await writeJsonToGCS(filePath, data);

      await interaction.reply({
        content: `✅【${type.toUpperCase()}】 ${num}${target === 'num' ? '人' : '本'} の反応文を保存しました。\n登録数: ${values.length}`,
        flags: InteractionResponseFlags.Ephemeral,
      });

    } catch (error) {
      console.error('[hikkakeReactSubmit] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 反応文の保存中にエラーが発生しました。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  },
};
