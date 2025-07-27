// interactions/hikkakePlakamaSelect.js

const { readState, writeState } = require('../utils/hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');
const { logToThread } = require('../utils/threadLogger'); // ログ出力用

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_plakama_select$/,
  async handle(interaction) {
    try {
      const type = interaction.customId.split('_')[1];
      const selected = parseInt(interaction.values[0], 10);
      const guildId = interaction.guildId;
      const channelId = interaction.channelId;

      if (isNaN(selected) || selected < 1) {
        return await interaction.reply({ content: '人数が不正です。', ephemeral: true });
      }

      const state = await readState(guildId);

      if (!state[type]) state[type] = {};
      if (!state[type][channelId]) {
        state[type][channelId] = { pura: 0, kama: 0, orders: [], messageId: null };
      }
      if (typeof state[type][channelId].pura !== 'number') {
        state[type][channelId].pura = 0;
      }

      // 追加する場合
      state[type][channelId].pura += selected;

      // // 上書きにしたい場合は以下を使う
      // state[type][channelId].pura = selected;

      await writeState(guildId, state);

      // パネル用Embedはplakama合計やcasualも必要ならここで計算して渡すのが理想ですが
      // ひとまず個別値だけでEmbed作る場合、buildPanelEmbedの引数に合わせて整形してください
      // 例:
      const embedData = {
        plakama: state[type][channelId].pura + (state[type][channelId].kama || 0),
        flat: 0,
        order: 0,
      };
      const updatedEmbed = buildPanelEmbed(type, embedData);

      const components = buildPanelButtons(type);

      try {
        const messageId = state[type][channelId].messageId;
        if (messageId) {
          const msg = await interaction.channel.messages.fetch(messageId);
          await msg.edit({ embeds: [updatedEmbed], components });
        } else {
          console.warn(`[hikkakePlakamaSelect] messageId未設定のため編集できません。`);
        }
      } catch (e) {
        console.warn(`[hikkakePlakamaSelect] メッセージ編集失敗:`, e);
      }

      // ログ出力（threadLogger）を追加
      try {
        await logToThread(guildId, type, interaction.client, {
          user: interaction.user,
          logType: 'プラカマ',
          details: { pura: selected, kama: 0 },
          channelName: interaction.channel.name,
        });
      } catch (e) {
        console.warn('[hikkakePlakamaSelect] ログ出力失敗:', e);
      }

      await interaction.reply({ content: `${selected}人のプラが追加されました。`, ephemeral: true });
    } catch (error) {
      console.error('[hikkakePlakamaSelect] エラー:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '処理中にエラーが発生しました。', ephemeral: true });
      }
    }
  }
};
