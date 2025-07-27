// interactions/hikkakeReactSelector.js

const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: /^set_react_(quest|tosu|horse)_(num|count)$/,  // 正規表現で共通化
  async handle(interaction) {
    try {
      // customIdからtype, targetを抽出
      const [, type, target] = interaction.customId.match(/^set_react_(quest|tosu|horse)_(num|count)$/);

      // 種類の日本語ラベル
      const typeLabel = {
        quest: 'クエスト',
        tosu: '凸スナ',
        horse: 'トロイの木馬',
      }[type] ?? '不明';

      // 対象の日本語ラベル
      const targetLabel = {
        num: '人数',
        count: '本数',
      }[target] ?? '不明';

      // セレクトメニュー作成
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`react_count_select_${type}_${target}`)
        .setPlaceholder(`設定する${typeLabel}の${targetLabel}を選んでください`)
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          Array.from({ length: 25 }, (_, i) => ({
            label: `${i + 1} ${target === 'num' ? '人' : '本'}`,
            value: `${i + 1}`,
          }))
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      // 返信
      await interaction.reply({
        content: `✅ ${typeLabel} の ${targetLabel}数を選択してください。`,
        components: [row],
        ephemeral: true,
      });
    } catch (error) {
      console.error('[hikkakeReactSelector] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '選択肢の表示中にエラーが発生しました。', ephemeral: true });
      }
    }
  },
};
