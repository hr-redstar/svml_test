// hikkake_bot/utils/hikkakeLeaveSelect.js (previously hikkakeCasualSelect.js)
const { readState, writeState } = require('./hikkakeStateManager');
const { updateAllHikkakePanels } = require('./hikkakePanelManager');
const { logToThread } = require('./threadLogger');
const { createSelectMenuRow, createNumericOptions } = require('./discordUtils');

module.exports = {
  customId: /^hikkake_leave_step(1|2)_(quest|tosu|horse)/,
  async handle(interaction) {
    const match = interaction.customId.match(this.customId);
    const step = parseInt(match[1], 10);
    const type = match[2];

    if (step === 1) {
      // Step 1: プラの人数を受け取り、カマの人数選択メニューを表示
      const puraLeaveCount = interaction.values[0];
      const newCustomId = `hikkake_leave_step2_${type}_${puraLeaveCount}`;
      const row = createSelectMenuRow(newCustomId, '退店したカマの人数を選択 (0-24)', createNumericOptions(25, '人', 0));
      await interaction.update({
        content: `【${type.toUpperCase()}】退店プラ: ${puraLeaveCount}人。次に退店したカマの人数を選択してください。`,
        components: [row],
      });
    } else if (step === 2) {
      // Step 2: カマの人数を受け取り、最終処理
      // Immediately acknowledge the interaction to prevent timeout
      await interaction.deferUpdate();

      const puraLeaveCount = parseInt(interaction.customId.split('_')[5], 10);
      const kamaLeaveCount = parseInt(interaction.values[0], 10);

      if (isNaN(puraLeaveCount) || isNaN(kamaLeaveCount)) {
        return interaction.editReply({ content: 'エラー: 人数の解析に失敗しました。', components: [] });
      }

      const guildId = interaction.guildId;
      const state = await readState(guildId);

      // スタッフ数を減算
      state.staff[type].pura = Math.max(0, (state.staff[type].pura || 0) - puraLeaveCount);
      state.staff[type].kama = Math.max(0, (state.staff[type].kama || 0) - kamaLeaveCount);

      // 受注一覧にログとして追加
      const newLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'casual_leave', // This is a custom type for rendering
        people: puraLeaveCount + kamaLeaveCount,
        bottles: 0, // No bottles for this action
        castPura: puraLeaveCount,
        castKama: kamaLeaveCount,
        timestamp: new Date().toISOString(),
        user: {
            id: interaction.user.id,
            username: interaction.user.username,
        },
        logUrl: null,
      };

      try {
        const logMessage = await logToThread(guildId, type, interaction.client, {
          user: interaction.user,
          logType: 'スタッフ退店',
          details: { pura: puraLeaveCount, kama: kamaLeaveCount },
          channelName: interaction.channel.name,
        });
        if (logMessage) {
            newLogEntry.logUrl = logMessage.url;
        }
      } catch (e) {
        console.warn('[hikkakeLeaveSelect] ログ出力失敗', e);
      }

      state.orders[type].push(newLogEntry);

      await writeState(guildId, state);
      await updateAllHikkakePanels(interaction.client, guildId, state);

      await interaction.editReply({
        content: `✅ 【${type.toUpperCase()}】の退店処理 (プラ: ${puraLeaveCount}人, カマ: ${kamaLeaveCount}人) を記録しました。`,
        components: [],
      });
    }
  }
};