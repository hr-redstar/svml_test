// interactions/hikkakePlakamaSelect.js

const { readState, writeState } = require('../utils/hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');

module.exports = {
  customId: /^hikkake_(quest|tosu|horse)_plakama_select$/,
  async handle(interaction) {
    const type = interaction.customId.split('_')[1];
    const selected = parseInt(interaction.values[0], 10);
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const channelId = interaction.channelId;

    const state = await readState(guildId);

    if (!state[type]) state[type] = {};
    if (!state[type][channelId]) state[type][channelId] = { pura: 0, kama: 0 };
    state[type][channelId].pura += selected;

    await writeState(guildId, state);

    // パネル更新
    const updatedEmbed = buildPanelEmbed(type, state[type][channelId]);
    const components = [buildPanelButtons(type)];

    // メッセージ更新
    try {
      const messageId = state[type][channelId].messageId;
      const msg = await interaction.channel.messages.fetch(messageId);
      await msg.edit({ embeds: [updatedEmbed], components });
    } catch (e) {
      console.warn(`[編集失敗] メッセージ取得不可`, e);
    }

    await interaction.reply({ content: `${selected}人のプラが追加されました。`, ephemeral: true });

    // ✅ 今後：ログ出力処理（threadLogger）追加予定
  }
};
