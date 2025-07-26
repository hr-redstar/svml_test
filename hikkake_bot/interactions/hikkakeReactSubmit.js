const { readJsonFromGCS, writeJsonToGCS } = require('../utils/gcs');
const { ModalSubmitInteraction } = require('discord.js');

module.exports = {
  customId: /^react_modal_(quest|tosu|horse)_(num|count)_(\d{1,2})$/,
  /**
   * @param {ModalSubmitInteraction} interaction
   */
  async handle(interaction) {
    const [, type, target, num] = interaction.customId.match(/^react_modal_(quest|tosu|horse)_(num|count)_(\d{1,2})$/);
    const guildId = interaction.guildId;
    const value = interaction.fields.getTextInputValue('react_text');
    const values = value
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    const filePath = `hikkake/${guildId}/reactions.json`;
    const data = await readJsonFromGCS(filePath);

    if (!data[type]) data[type] = {};
    if (!data[type][target]) data[type][target] = {};
    if (!data[type][target][num]) data[type][target][num] = [];

    // 上書き or 追記（ここでは上書き）
    data[type][target][num] = values;

    await writeJsonToGCS(filePath, data);

    await interaction.reply({
      content: `✅ ${type}：${num}${target === 'num' ? '人' : '本'} の反応文を保存しました。\n登録数: ${values.length}`,
      ephemeral: true,
    });
  },
};
