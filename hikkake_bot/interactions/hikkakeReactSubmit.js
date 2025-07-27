// hikkake_bot/interactions/hikkakeReactSubmit.js

const { readJsonFromGCS, writeJsonToGCS } = require('../utils/gcs');
const { ModalSubmitInteraction } = require('discord.js');

module.exports = {
  customId: /^react_modal_(quest|tosu|horse)_(num|count)_(\d{1,2})$/,
  /**
   * @param {ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    try {
      // customIdからタイプ、対象、番号を取得
      const [, type, target, num] = interaction.customId.match(/^react_modal_(quest|tosu|horse)_(num|count)_(\d{1,2})$/);
      const guildId = interaction.guildId;

      // テキスト入力値を取得し、カンマ区切りで分割
      const value = interaction.fields.getTextInputValue('react_text');
      const values = value
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0);

      // GCSから既存の反応文データを読み込み。なければ空オブジェクト
      const filePath = `hikkake/${guildId}/reactions.json`;
      let data = {};
      try {
        data = await readJsonFromGCS(filePath);
      } catch (e) {
        console.warn(`[hikkakeReactSubmit] GCS読み込み失敗、初期データ使用: ${filePath}`, e.message);
        data = {};
      }

      // 階層構造を作り反応文を上書き保存
      if (!data[type]) data[type] = {};
      if (!data[type][target]) data[type][target] = {};
      data[type][target][num] = values;

      await writeJsonToGCS(filePath, data);

      // 保存完了メッセージ返信
      await interaction.reply({
        content: `✅ 【${type.toUpperCase()}】 ${num}${target === 'num' ? '人' : '本'} の反応文を保存しました。\n登録数: ${values.length}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('[hikkakeReactSubmit] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '反応文の保存中にエラーが発生しました。', ephemeral: true });
      }
    }
  },
};
