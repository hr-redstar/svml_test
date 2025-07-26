// commands/hikkakeSetup.js
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { writeState, readState } = require('../utils/hikkakeStateManager');
const { buildPanelEmbed, buildPanelButtons } = require('../utils/panelBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ひっかけ一覧設置')
    .setDescription('クエスト・凸スナ・トロイの木馬の設置チャンネルを選択し、一覧パネルを設置します。')
    .addChannelOption(option =>
      option.setName('quest_channel')
        .setDescription('クエスト設置チャンネルを選択してください')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('tosu_channel')
        .setDescription('凸スナ設置チャンネルを選択してください')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('horse_channel')
        .setDescription('トロイの木馬設置チャンネルを選択してください')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const questChannel = interaction.options.getChannel('quest_channel');
    const tosuChannel = interaction.options.getChannel('tosu_channel');
    const horseChannel = interaction.options.getChannel('horse_channel');

    // state読み込み・初期化
    let state = await readState(guildId);
    if (!state) state = {};
    if (!state.counts) {
      state.counts = {
        quest: { pura: 0, kama: 0 },
        tosu: { pura: 0, kama: 0 },
        horse: { pura: 0, kama: 0 },
      };
    }

    try {
      // メッセージ送信を並列化
      const [questMsg, tosuMsg, horseMsg] = await Promise.all([
        questChannel.send({
          embeds: [buildPanelEmbed('quest', state.counts.quest)],
          components: [buildPanelButtons('quest')]
        }),
        tosuChannel.send({
          embeds: [buildPanelEmbed('tosu', state.counts.tosu)],
          components: [buildPanelButtons('tosu')]
        }),
        horseChannel.send({
          embeds: [buildPanelEmbed('horse', state.counts.horse)],
          components: [buildPanelButtons('horse')]
        }),
      ]);

      // state更新
      state.panelMessages = {
        quest: {
          channelId: questChannel.id,
          messageId: questMsg.id,
          threadId: null,
        },
        tosu: {
          channelId: tosuChannel.id,
          messageId: tosuMsg.id,
          threadId: null,
        },
        horse: {
          channelId: horseChannel.id,
          messageId: horseMsg.id,
          threadId: null,
        },
      };

      await writeState(guildId, state);

      await interaction.reply({ content: '✅ ひっかけ一覧パネルを設置しました。', ephemeral: true });
    } catch (error) {
      console.error('[ひっかけ一覧設置] エラー:', error);
      await interaction.reply({ content: '❌ パネル設置に失敗しました。管理者にお問い合わせください。', ephemeral: true });
    }
  }
};
