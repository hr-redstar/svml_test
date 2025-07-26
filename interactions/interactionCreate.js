// interactionCreate.js

const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  InteractionType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  EmbedBuilder,
} = require('discord.js');
const { readFileNamesFromGCS, readJsonFromGCS, saveJsonToGCS } = require('../utils/gcs');
const path = require('path');

const BUCKET_NAME = 'data-svml'; // 必要に応じて .env や config に変更

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const guildId = interaction.guildId;

    // 売上報告ボタンが押されたとき
    if (interaction.isButton() && interaction.customId === 'sales_report') {
      const modal = new ModalBuilder()
        .setCustomId('sales_modal')
        .setTitle('売上報告');

      const dateInput = new TextInputBuilder()
        .setCustomId('date')
        .setLabel('日付 (例: 7/7)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const totalInput = new TextInputBuilder()
        .setCustomId('total')
        .setLabel('総売り (数字のみ)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const cashInput = new TextInputBuilder()
        .setCustomId('cash')
        .setLabel('現金')
        .setStyle(TextInputStyle.Short);

      const cardInput = new TextInputBuilder()
        .setCustomId('card')
        .setLabel('カード')
        .setStyle(TextInputStyle.Short);

      const expenseInput = new TextInputBuilder()
        .setCustomId('expense')
        .setLabel('諸経費')
        .setStyle(TextInputStyle.Short);

      const row1 = new ActionRowBuilder().addComponents(dateInput);
      const row2 = new ActionRowBuilder().addComponents(totalInput);
      const row3 = new ActionRowBuilder().addComponents(cashInput);
      const row4 = new ActionRowBuilder().addComponents(cardInput);
      const row5 = new ActionRowBuilder().addComponents(expenseInput);

      modal.addComponents(row1, row2, row3, row4, row5);

      await interaction.showModal(modal);
      return;
    }

    // 売上報告モーダルの送信時
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'sales_modal') {
      await interaction.deferReply({ ephemeral: true });

      const date = interaction.fields.getTextInputValue('date');
      const total = interaction.fields.getTextInputValue('total');
      const cash = interaction.fields.getTextInputValue('cash');
      const card = interaction.fields.getTextInputValue('card');
      const expense = interaction.fields.getTextInputValue('expense');

      const now = new Date();
      const year = now.getFullYear();
      const timestamp = now.toISOString();
      const fileName = `${year}_${date.replace(/\//g, '-')}_${interaction.user.id}.json`;
      const filePath = `data/${guildId}/sales/${fileName}`;

      const report = {
        user: {
          id: interaction.user.id,
          tag: interaction.user.tag,
        },
        date,
        total,
        cash,
        card,
        expense,
        submittedAt: timestamp,
      };

      await saveJsonToGCS(filePath, report);

      await interaction.editReply({
        content: `✅ 売上報告を保存しました。\nファイル名: \`${fileName}\``,
      });
      return;
    }

    // 日付・月・四半期選択のメニューに対応
    if (interaction.isStringSelectMenu()) {
      const { customId, values } = interaction;
      if (!['select_date', 'select_month', 'select_quarter'].includes(customId)) return;

      await interaction.deferReply({ ephemeral: true });
      const prefixMap = {
        select_date: '',
        select_month: 'month_',
        select_quarter: 'quarter_',
      };

      const selected = values[0];
      const fileName = `${prefixMap[customId]}${selected}.csv`;
      const fileUrl = `https://storage.googleapis.com/${BUCKET_NAME}/data/${guildId}/csv/${fileName}`;

      const embed = new EmbedBuilder()
        .setTitle('📄 CSVダウンロード')
        .setDescription(`以下のリンクからCSVをダウンロードできます：\n[${fileName}](${fileUrl})`)
        .setColor(0x00AE86);

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // CSVダウンロードボタン押下時 → 対象ファイル一覧を取得
    if (interaction.isButton() && ['csv_date', 'csv_month', 'csv_quarter'].includes(interaction.customId)) {
      await interaction.deferReply({ ephemeral: true });

      const type = interaction.customId.replace('csv_', '');
      const dirPath = `data/${guildId}/csv/`;

      const files = await readFileNamesFromGCS(dirPath);
      const filtered = files.filter(f => {
        if (type === 'date') return /^\d{4}-\d{1,2}.*\.csv$/.test(f);
        if (type === 'month') return /^month_\d{4}-\d{1,2}\.csv$/.test(f);
        if (type === 'quarter') return /^quarter_\d{4}_Q[1-4]\.csv$/.test(f);
        return false;
      });

      if (filtered.length === 0) {
        await interaction.editReply({ content: '対象ファイルが見つかりませんでした。' });
        return;
      }

      if (filtered.length === 1) {
        const fileName = filtered[0];
        const fileUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${dirPath}${fileName}`;
        const embed = new EmbedBuilder()
          .setTitle('📄 CSVダウンロード')
          .setDescription(`[${fileName}](${fileUrl}) をダウンロードできます。`)
          .setColor(0x00AE86);

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // 選択メニューを表示（複数候補）
      const options = filtered.map(f => ({
        label: f.replace(/^(month_|quarter_)?/, '').replace('.csv', ''),
        value: f.replace(/^(month_|quarter_)?/, '').replace('.csv', ''),
      }));

      const select = new StringSelectMenuBuilder()
        .setCustomId(`select_${type}`)
        .setPlaceholder('ダウンロードするCSVを選択...')
        .addOptions(options.slice(0, 25));

      const row = new ActionRowBuilder().addComponents(select);
      await interaction.editReply({ content: 'ダウンロード対象を選択してください。', components: [row] });
    }
  },
};
