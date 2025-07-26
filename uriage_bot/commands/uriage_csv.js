const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  EmbedBuilder,
  InteractionResponseFlags,
} = require('discord.js');
const { listFilesInGCS, generateSignedUrl } = require('../utils/gcs');

// ✅ スラッシュコマンド実行時にボタンで期間選択
async function sendSalesReportMenu(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('📊 売上報告CSV')
    .setDescription(
      '売上報告を確認したい期間の種類を選択してください。\n\n' +
      '👉 年月日ボタン  📅 日付単位で選択\n' +
      '👉 年月ボタン    🗓️ 月単位で選択\n' +
      '👉 4半期ボタン  📈 3ヶ月単位で選択'
    );

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('select_date')
      .setLabel('年月日')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('select_month')
      .setLabel('年月')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('select_quarter')
      .setLabel('４半期')
      .setStyle(ButtonStyle.Primary),
  );

  await interaction.reply({ embeds: [embed], components: [buttons] });
}

// ✅ ボタン押下時：ファイル一覧を取得してセレクトメニューを生成
async function handleButton(interaction) {
  // このコマンドが処理すべきボタンか確認
  if (!['select_date', 'select_month', 'select_quarter'].includes(interaction.customId)) {
    return false; // 処理対象外
  }

  const guildId = interaction.guildId;

  // GCSからファイル一覧取得 (共通関数を利用)
  const prefix = `data/sales_reports/${guildId}/`;
  const files = await listFilesInGCS(prefix);
  const allFiles = files.map(f => f.name);

  // ファイル名から日付部分を抽出
  const parseDateFromFilename = (filename) => {
    const regex = /uriage-houkoku-(\d{4}-\d{2}(?:-\d{2})?)-/;
    const match = filename.match(regex);
    return match ? match[1] : null;
  };

  const dates = allFiles.map(parseDateFromFilename).filter(Boolean);

  let options = [];

  if (interaction.customId === 'select_date') {
    const uniqueDates = [...new Set(dates.filter(d => d.length === 10))].sort((a, b) => new Date(b) - new Date(a));
    options = uniqueDates.map(date => ({
      label: date,
      description: `日付: ${date}`,
      value: date,
    }));
  } else if (interaction.customId === 'select_month') {
    const uniqueMonths = [...new Set(dates.map(d => d.slice(0, 7)))].sort((a, b) => new Date(b + '-01') - new Date(a + '-01'));
    options = uniqueMonths.map(month => ({
      label: month,
      description: `月: ${month}`,
      value: month,
    }));
  } else if (interaction.customId === 'select_quarter') {
    const uniqueMonths = [...new Set(dates.map(d => d.slice(0, 7)))];
    const quarters = {};

    uniqueMonths.forEach(month => {
      const [year, mon] = month.split('-').map(Number);
      const qStart = Math.floor((mon - 1) / 3) * 3 + 1;
      const qEnd = qStart + 2;
      const label = `${year}-${String(qStart).padStart(2, '0')}~${year}-${String(qEnd).padStart(2, '0')}`;
      if (!quarters[label]) quarters[label] = [];
      quarters[label].push(month);
    });

    const sortedLabels = Object.keys(quarters).sort((a, b) => new Date(b.split('~')[1]) - new Date(a.split('~')[1]));
    options = sortedLabels.map(label => ({
      label,
      description: `4半期: ${label}`,
      value: label,
    }));
  }

  if (options.length === 0) {
    const msg = '該当するCSVファイルが見つかりませんでした。';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: msg });
    } else {
      await interaction.reply({ content: msg });
    }
    return true; // 処理完了
  }

  const selectMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select_csv_${interaction.customId}`)
      .setPlaceholder('期間を選択しました。次にCSVファイルを選択してください。')
      .addOptions(options.slice(0, 25))
  );

  await interaction.update({ content: '期間を選択しました。次にCSVファイルを選択してください。', components: [selectMenu], embeds: [] });
  return true; // 処理完了
}

// ✅ セレクトメニュー選択後：CSVの署名付きURLを返信
async function handleSelectMenu(interaction) {
  // このコマンドが処理すべきセレクトメニューか確認
  if (!interaction.customId.startsWith('select_csv_')) {
    return false; // 処理対象外
  }

  const guildId = interaction.guildId;
  const selectedValue = interaction.values[0];
  const type = interaction.customId.replace('select_csv_', '');

  // GCSからファイル一覧取得 (共通関数を利用)
  const prefix = `data/sales_reports/${guildId}/`;
  const files = await listFilesInGCS(prefix);
  let matchedFiles = [];

  if (type === 'select_date') {
    matchedFiles = files.filter(f => f.name.includes(`uriage-houkoku-${selectedValue}-`));
  } else if (type === 'select_month') {
    matchedFiles = files.filter(f => f.name.includes(`uriage-houkoku-${selectedValue}`));
  } else if (type === 'select_quarter') {
    const [start, end] = selectedValue.split('~');
    matchedFiles = files.filter(f => {
      const match = f.name.match(/uriage-houkoku-(\d{4}-\d{2})/);
      if (!match) return false;
      const fileMonth = match[1];
      return fileMonth >= start && fileMonth <= end;
    });
  }

  if (matchedFiles.length === 0) {
    const msg = '該当するCSVファイルが見つかりませんでした。';
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: msg });
    } else {
      await interaction.reply({ content: msg });
    }
    return true; // 処理完了
  }

  // ファイル名で降順ソートして最新のファイルを取得する
  matchedFiles.sort((a, b) => b.name.localeCompare(a.name));

  const file = matchedFiles[0];

  const signedUrl = await generateSignedUrl(file.name, 15);
  const issuedAt = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const embed = new EmbedBuilder()
    .setTitle('📄 売上報告CSV')
    .setDescription(
      `選択された期間: ${selectedValue}\n` +
      `[こちらをクリックしてCSVファイルをダウンロード](${signedUrl})\n\n` +
      `**URL発行時間:** ${issuedAt}\n` +
      `このURLは発行から15分間有効です。`
    )
    .setColor(0x00AE86);

  await interaction.update({ embeds: [embed], components: [] });
  return true; // 処理完了
}

// ✅ モジュールエクスポート
module.exports = {
  data: new SlashCommandBuilder()
    .setName('uriage_csv')
    .setDescription('売上報告CSVの閲覧用メニューを表示します'),
  async execute(interaction) {
    await sendSalesReportMenu(interaction);
  },
  handleButton,
  handleSelectMenu,
};
