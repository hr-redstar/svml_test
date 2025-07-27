// index.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  InteractionResponseFlags,
} = require('discord.js');

// --- 必須環境変数チェック ---
const requiredEnv = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    console.error(`❌ 致命的エラー: 環境変数 ${envVar} が .env に設定されていません。`);
    process.exit(1);
  }
}

console.log('Google Credentials Path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// --- コマンドファイルを再帰的に読み込む関数 ---
function loadCommandFiles(dir) {
  const commandFiles = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      commandFiles.push(...loadCommandFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      commandFiles.push(fullPath);
    }
  }
  return commandFiles;
}

// --- コマンド読み込みディレクトリ ---
const commandDirs = [
  path.join(__dirname, 'commands'),
  path.join(__dirname, 'uriage_bot', 'commands'),
  path.join(__dirname, 'hikkake_bot', 'commands'),
];

// --- コマンドのロード処理 ---
for (const dir of commandDirs) {
  if (!fs.existsSync(dir)) continue;
  const commandFiles = loadCommandFiles(dir);

  for (const file of commandFiles) {
    try {
      const command = require(file);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`⚠️ 無効なコマンドファイル: ${path.relative(__dirname, file)}`);
      }
    } catch (error) {
      console.error(`❌ コマンドファイル読み込み失敗: ${path.relative(__dirname, file)}`, error);
    }
  }
}
console.log(`✅ ${client.commands.size} 個のコマンドを読み込みました。`);

// --- モーダル・ボタンハンドラ読み込み ---
const modalHandler = require(path.join(__dirname, 'uriage_bot', 'utils', 'uriage_modals.js'));
const buttonHandler = require(path.join(__dirname, 'uriage_bot', 'utils', 'uriage_buttons.js'));

const hikkakeButtonHandler = require(path.join(__dirname, 'hikkake_bot', 'utils', 'hikkake_button_handler.js'));
const hikkakeSelectHandler = require(path.join(__dirname, 'hikkake_bot', 'utils', 'hikkake_select_handler.js'));

// --- Bot起動ログ ---
client.once(Events.ClientReady, () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
});

// --- インタラクション総合ハンドリング ---
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // スラッシュコマンド処理
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // ボタン押下の汎用ハンドラ優先処理
    if (interaction.isButton()) {
      if (await buttonHandler.execute(interaction)) return;
      if (await hikkakeButtonHandler.execute(interaction)) return;
    }

    // モーダル送信の汎用ハンドラ優先処理
    if (interaction.isModalSubmit()) {
      if (await modalHandler.execute(interaction)) return;
    }

    // セレクトメニュー処理（hikkake系のものが多いため専用ハンドラも使用）
    if (interaction.isStringSelectMenu() || interaction.isRoleSelectMenu()) {
      // hikkakeセレクトメニューの汎用処理
      if (await hikkakeSelectHandler.execute(interaction)) return;
    }
  } catch (error) {
    console.error('❌ インタラクション処理エラー:', error);

    const errorMessage = {
      content: 'コマンド実行中にエラーが発生しました。',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// --- Discord Bot ログイン ---
client.login(process.env.DISCORD_TOKEN);
