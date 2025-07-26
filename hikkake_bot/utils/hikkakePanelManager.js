// utils/hikkakePanelManager.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { readState } = require('./hikkakeStateManager');
const { getGuild } = require('./discordUtils'); // Guild取得補助（未実装なら別途作成）

/**
 * すべてのhikkakeパネルを更新
 * @param {string} guildId 
 * @param {object} state 
 */
async function updateAllHikkakePanels(guildId, state) {
  const guild = await getGuild(guildId);
  if (!guild) return;

  const panelTypes = ['quest', 'tosu', 'horse'];

  for (const type of panelTypes) {
    const panelInfo = state[type]?.panel;
    const currentData = state[type] || {};

    if (!panelInfo || !Array.isArray(panelInfo)) continue;

    for (const { channelId, messageId } of panelInfo) {
      try {
        const channel = await guild.channels.fetch(channelId);
        if (!channel) continue;

        const message = await channel.messages.fetch(messageId);
        if (!message) continue;

        const embed = buildPanelEmbed(type, currentData);
        const components = buildPanelButtons(type);

        await message.edit({ embeds: [embed], components });
      } catch (err) {
        console.warn(`[updateAllHikkakePanels] Failed to update ${type} panel in channel ${channelId}:`, err.message);
      }
    }
  }
}

/**
 * パネル用のEmbedを生成
 * @param {'quest' | 'tosu' | 'horse'} type 
 * @param {object} data 
 * @returns {EmbedBuilder}
 */
function buildPanelEmbed(type, data) {
  const titleMap = {
    quest: '🎯 クエスト一覧',
    tosu: '💥 凸スナ一覧',
    horse: '🐴 トロイの木馬一覧',
  };

  const embed = new EmbedBuilder()
    .setTitle(titleMap[type])
    .setDescription(
      [
        `👥 **受注人数：** ${data.order ?? 0}`,
        `📌 **プラカマ：** ${data.plakama ?? 0}`,
        `🚶 **ふらっと来ちゃった：** ${data.flat ?? 0}`,
      ].join('\n')
    )
    .setColor(0x0099ff)
    .setFooter({ text: `最終更新：${new Date().toLocaleString('ja-JP')}` });

  return embed;
}

/**
 * パネル用ボタンを生成
 * @param {'quest' | 'tosu' | 'horse'} type 
 * @returns {ActionRowBuilder[]}
 */
function buildPanelButtons(type) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_plakama`)
      .setLabel('プラカマ')
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_order`)
      .setLabel('受注')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`hikkake_${type}_flat`)
      .setLabel('ふらっと来ちゃった')
      .setStyle(ButtonStyle.Secondary)
  );

  return [row];
}

module.exports = {
  updateAllHikkakePanels,
};
