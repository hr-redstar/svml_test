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

// --- 必須の環境変数をチェック ---
const requiredEnv = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    console.error(`❌ 致命的エラー: 環境変数 ${envVar} が .env ファイルに設定されていません。`);
    process.exit(1);
  }
}

console.log('Google Credentials Path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

// --- Slashコマンド読み込み (再帰的に) ---
function loadCommandFiles(dir) {
  const commandFilePaths = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      commandFilePaths.push(...loadCommandFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      commandFilePaths.push(fullPath);
    }
  }
  return commandFilePaths;
}

const commandDirs = [
  path.join(__dirname, 'commands'),
  path.join(__dirname, 'uriage_bot', 'commands'),
  path.join(__dirname, 'hikkake_bot', 'commands'), // 追加
];

for (const dir of commandDirs) {
  if (!fs.existsSync(dir)) continue;
  const commandFiles = loadCommandFiles(dir);
  for (const file of commandFiles) {
    try {
      const command = require(file);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`⚠️ 無効なコマンドファイルです: ${path.relative(__dirname, file)}`);
      }
    } catch (e) {
      console.error(`❌ コマンドファイル読み込み失敗: ${path.relative(__dirname, file)}`, e);
    }
  }
}
console.log(`✅ ${client.commands.size} 個のコマンドを読み込みました。`);

// --- モーダルおよび編集ボタン処理 ---
const modalHandler = require(path.join(__dirname, 'uriage_bot', 'utils', 'uriage_modals.js'));
const buttonHandler = require(path.join(__dirname, 'uriage_bot', 'utils', 'uriage_buttons.js'));

// --- hikkake_bot用 汎用ハンドラ追加 ---
const hikkakeModalHandler = require(path.join(__dirname, 'hikkake_bot', 'utils', 'hikkake_modals.js'));
const hikkakeButtonHandler = require(path.join(__dirname, 'hikkake_bot', 'utils', 'hikkake_button_handler.js')); // ファイル名に注意
const hikkakeSelectHandler = require(path.join(__dirname, 'hikkake_bot', 'utils', 'hikkake_select_handler.js')); // 修正: 正しいセレクトメニューハンドラを読み込む

// --- 起動ログ ---
client.once(Events.ClientReady, () => {
  console.log(`✅ ログイン成功: ${client.user.tag}`);
});

// --- Interaction全体の処理 ---
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // スラッシュコマンドの処理
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // 汎用ハンドラを先に試す
    if (interaction.isButton()) {
      if (await buttonHandler.execute(interaction)) return;
      if (await hikkakeButtonHandler.execute(interaction)) return;
    }
    if (interaction.isModalSubmit()) {
      if (await modalHandler.execute(interaction)) return;
      if (await hikkakeModalHandler.execute(interaction)) return;
    }
    if (interaction.isStringSelectMenu()) {
      if (await hikkakeSelectHandler.execute(interaction)) return; // hikkake_select_handler.js が処理
    }

    // 各コマンドファイルに処理を委譲
    for (const command of client.commands.values()) {
      if (interaction.isButton() && typeof command.handleButton === 'function') {
        if (await command.handleButton(interaction)) return;
      }
      if (interaction.isStringSelectMenu() && typeof command.handleSelectMenu === 'function') {
        if (await command.handleSelectMenu(interaction)) return;
      }
      if (interaction.isRoleSelectMenu() && typeof command.handleRoleSelectMenu === 'function') {
        if (await command.handleRoleSelectMenu(interaction)) return;
      }
    }
  } catch (error) {
    console.error('❌ インタラクション処理エラー:', error);

    const errorMessage = {
      content: 'コマンド実行中にエラーが発生しました。',
      flags: InteractionResponseFlags.Ephemeral,
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
