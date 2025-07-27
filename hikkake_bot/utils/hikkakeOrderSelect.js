// hikkake_bot/utils/hikkakeOrderSelect.js
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
  customId: /^hikkake_order_step(1|2|3)_(quest|tosu|horse)/,
  async handle(interaction) {
    const match = interaction.customId.match(this.customId);
    const step = parseInt(match[1], 10);
    const type = match[2];

    if (step === 1) {
      // Step 1: プラの人数を受け取り、カマの人数選択メニューを表示
      const castPura = interaction.values[0];
      const newCustomId = `hikkake_order_step2_${type}_${castPura}`;
      const row = createSelectMenuRow(newCustomId, '担当カマの人数を選択 (0-25)', createNumericOptions(26, '人', 0));
      await interaction.update({
        content: `【${type.toUpperCase()}】担当プラ: ${castPura}人。次に担当したカマの人数を選択してください。`,
        components: [row],
      });
    } else if (step === 2) {
      // Step 2: カマの人数を受け取り、ボトルの本数選択メニューを表示
      const parts = interaction.customId.split('_');
      const castPura = parts[4];
      const castKama = interaction.values[0];
      const newCustomId = `hikkake_order_step3_${type}_${castPura}_${castKama}`;
      const row = createSelectMenuRow(newCustomId, 'ボトルの本数を選択 (1-25)', createNumericOptions(25, '本'));
      await interaction.update({
        content: `【${type.toUpperCase()}】担当プラ: ${castPura}人, カマ: ${castKama}人。次にボトルの本数を選択してください。`,
        components: [row],
      });
    } else if (step === 3) {
        // Step 3: ボトルの本数を受け取り、最終処理
        const parts = interaction.customId.split('_');
        const castPura = parseInt(parts[4], 10);
        const castKama = parseInt(parts[5], 10);
        const bottles = parseInt(interaction.values[0], 10);

        if ([castPura, castKama, bottles].some(isNaN)) {
            return interaction.update({ content: 'エラー: 数値の解析に失敗しました。', components: [] });
        }

        const guildId = interaction.guildId;
        const state = await readState(guildId);

        // 利用可能なスタッフ数を計算
        const allocatedPura = state.orders[type].reduce((sum, order) => sum + (order.castPura || 0), 0);
        const allocatedKama = state.orders[type].reduce((sum, order) => sum + (order.castKama || 0), 0);
        const availablePura = (state.staff[type].pura || 0) - allocatedPura;
        const availableKama = (state.staff[type].kama || 0) - allocatedKama;

        if (castPura > availablePura || castKama > availableKama) {
            return interaction.update({
                content: `スタッフが不足しています。\n利用可能 - プラ: ${availablePura}人, カマ: ${availableKama}人`,
                components: [],
            });
        }

        const newOrder = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'order',
            // 受注人数は担当キャストの合計とする
            people: castPura + castKama,
            bottles,
            castPura,
            castKama,
            timestamp: new Date().toISOString(),
        };

        state.orders[type].push(newOrder);

        await writeState(guildId, state);
        await updateAllHikkakePanels(interaction.client, guildId, state);

        try {
            await logToThread(guildId, type, interaction.client, {
                user: interaction.user,
                logType: '受注',
                details: { people: newOrder.people, bottles, castPura, castKama },
                channelName: interaction.channel.name,
            });
        } catch (e) {
            console.warn('[hikkakeOrderSelect] ログ出力失敗', e);
        }

        await interaction.update({
            content: `✅ 【${type.toUpperCase()}】の受注を登録しました。`,
            components: [],
        });
    }
  }
};