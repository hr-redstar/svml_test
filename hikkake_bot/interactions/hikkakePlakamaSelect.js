// interactions/hikkakePlakamaSelect.js
const { readState, writeState } = require('../utils/hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');
const { logToThread } = require('../utils/threadLogger');
const { InteractionResponseFlags } = require('discord.js');

module.exports = {
   customId: /^hikkake_plakama_step(1|2)_(quest|tosu|horse)/,
  async handle(interaction) {
    try {
      // customIdからtypeを安全に抽出
      const match = interaction.customId.match(/^hikkake_(quest|tosu|horse)_plakama_select$/);
      if (!match) {
        return await interaction.reply({
          content: '不正な操作です。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
      const type = match[1];

      // 選択値の存在と数値変換チェック
      if (!interaction.values || !interaction.values[0]) {
        return await interaction.reply({
          content: '人数が選択されていません。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
      const selected = parseInt(interaction.values[0], 10);
      if (isNaN(selected) || selected < 1 || selected > 25) {
        return await interaction.reply({
          content: '人数は 1〜25 の範囲で選択してください。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }

      const guildId = interaction.guildId;
      const channelId = interaction.channelId;

      // 状態読み込み・初期化
      const state = await readState(guildId);
      if (!state[type]) state[type] = {};
      if (!state[type][channelId]) {
        state[type][channelId] = {
          pura: 0,
          kama: 0,
          orders: [],
          messageId: null,
        };
      }
      const channelState = state[type][channelId];

      // 追加 or 上書き の切替え（デフォルトは追加）
      // channelState.pura = selected; // ← 上書きにしたい場合はこちらを使う
      channelState.pura = (channelState.pura ?? 0) + selected;

      await writeState(guildId, state);

      // Embed作成用データ（必要に応じて拡張可能）
      const embedData = {
        plakama: (channelState.pura ?? 0) + (channelState.kama ?? 0),
        flat: 0,
        order: 0,
      };
      const updatedEmbed = buildPanelEmbed(type, embedData);
      const components = buildPanelButtons(type);

      // メッセージ編集
      try {
        const messageId = channelState.messageId;
        if (messageId) {
          const msg = await interaction.channel.messages.fetch(messageId);
          await msg.edit({ embeds: [updatedEmbed], components, content: '' });
        } else {
          console.warn(`[hikkakePlakamaSelect] メッセージID未設定のため編集できません。`);
        }
      } catch (e) {
        console.warn(`[hikkakePlakamaSelect] メッセージ編集失敗:`, e);
      }

      // ログ出力
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

      // 応答
      await interaction.reply({
        content: `✅ プラ人数を +${selected}人 に更新しました。`,
        flags: InteractionResponseFlags.Ephemeral,
      });

    } catch (error) {
      console.error('[hikkakePlakamaSelect] 例外:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '🚫 処理中にエラーが発生しました。',
          flags: InteractionResponseFlags.Ephemeral,
        });
      }
    }
  },
};
