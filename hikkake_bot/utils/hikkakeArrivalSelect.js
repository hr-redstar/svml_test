// hikkake_bot/utils/hikkakeArrivalSelect.js
const { readState, writeState } = require('./hikkakeStateManager');
const { updateAllHikkakePanels } = require('./hikkakePanelManager');
const { logToThread } = require('./threadLogger');
const { createSelectMenuRow, createNumericOptions } = require('./discordUtils');

module.exports = {
  customId: /^hikkake_arrival_step(1|2)_(quest|tosu|horse)/,
  async handle(interaction) {
    const match = interaction.customId.match(this.customId);
    const step = parseInt(match[1], 10);
    const type = match[2];

    if (step === 1) {
      // Step 1: プラの人数を受け取り、カマの人数選択メニューを表示
      const puraArrivalCount = interaction.values[0];
      const newCustomId = `hikkake_arrival_step2_${type}_${puraArrivalCount}`;
      const row = createSelectMenuRow(newCustomId, '追加カマの人数を選択 (0-24)', createNumericOptions(25, '人', 0));
      await interaction.update({
        content: `【${type.toUpperCase()}】追加プラ: ${puraArrivalCount}人。次に追加するカマの人数を選択してください。`,
        components: [row],
      });
    } else if (step === 2) {
      // Step 2: カマの人数を受け取り、最終処理
      await interaction.deferUpdate();

      const