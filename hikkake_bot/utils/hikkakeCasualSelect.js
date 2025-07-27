// hikkake_bot/utils/hikkakeCasualSelect.js
const { StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { readState, writeState } = require('./hikkakeStateManager');
const { updateAllHikkakePanels } = require('./hikkakePanelManager');
const { logToThread } = require('./threadLogger');

function createSelectMenuRow(customId, placeholder, options) {
  const selectMenu = new StringSelectMenuBuilder().setCustomId(customId).setPlaceholder(placeholder).addOptions(options);
  return new ActionRowBuilder().addComponents(selectMenu);
}

function createNumericOptions(count, unit, start = 1) {
    return Array.from({ length: count }, (_, i) => {
        const value = i + start;
        return new StringSelectMenuOptionBuilder().setLabel(`${value}${unit}`).setValue(String(value));
    });
}

module.exports = {
  customId: /^hikkake_casual_step(1|2)_(quest|tosu|horse)/,
  async handle(interaction) {
    const match = interaction.customId.match(this.customId);
    const step = parseInt(match[1], 10);
    const type = match[2];

    if (step === 1) {
      // Step 1: プラの人数を受け取り、カマの人数選択メニューを表示
      const puraAddCount = interaction.values[0];
      const newCustomId = `hikkake_casual_step2_${type}_${puraAddCount}`;
      const row = createSelectMenuRow(newCustomId, '追加カマの人数を選択 (1-25)', createNumericOptions(25, '人'));
      await interaction.update({
        content: `【${type.toUpperCase()}】追加プラ: ${puraAddCount}人。次に追加するカマの人数を選択してください。`,
        components: [row],
      });
    } else if (step === 2) {
      // Step 2: カマの人数を受け取り、最終処理
      const puraAddCount = parseInt(interaction.customId.split('_')[4], 10);
      const kamaAddCount = parseInt(interaction.values[0], 10);

      if (isNaN(puraAddCount) || isNaN(kamaAddCount)) {
        return interaction.update({ content: 'エラー: 人数の解析に失敗しました。', components: [] });
      }

      const guildId = interaction.guildId;
      const state = await readState(guildId);

      state.staff[type].pura += puraAddCount;
      state.staff[type].kama += kamaAddCount;

      await writeState(guildId, state);
      await updateAllHikkakePanels(interaction.client, guildId, state);

      try {
        await logToThread(guildId, type, interaction.client, {
          user: interaction.user,
          logType: 'ふらっと来た',
          details: { pura: puraAddCount, kama: kamaAddCount },
          channelName: interaction.channel.name,
        });
      } catch (e) {
        console.warn('[hikkakeCasualSelect] ログ出力失敗', e);
      }

      await interaction.update({
        content: `✅ 【${type.toUpperCase()}】に「ふらっと来た」スタッフ (プラ: ${puraAddCount}人, カマ: ${kamaAddCount}人) を追加しました。`,
        components: [],
      });
    }
  }
};