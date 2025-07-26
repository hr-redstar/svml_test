#!/bin/bash

set -e

echo "🟡 PM2 のグローバルインストール..."
sudo npm install -g pm2

echo "🟡 タイムゾーンを Asia/Tokyo に設定..."
sudo timedatectl set-timezone Asia/Tokyo

echo "🟡 SSH 鍵が存在するか確認..."
if [ ! -f ~/.ssh/id_rsa ]; then
  echo "🔐 SSH 鍵を作成中..."
  ssh-keygen -t rsa -b 4096 -C "star.vesta.legion.kanri@gmail.com" -N "" -f ~/.ssh/id_rsa
else
  echo "🔐 SSH 鍵は既に存在しています。"
fi

echo "🟡 svml_zimu_bot ディレクトリの作成と移動..."
mkdir -p ~/svml_zimu_bot
cd ~/svml_zimu_bot

if [ ! -d ".git" ]; then
  echo "🟡 Git リポジトリを SSH 経由でクローン中..."
  git clone git@github.com:star-discord/svml_zimu_bot.git .
else
  echo "🟡 既に Git リポジトリが存在します。リモートに合わせてローカルを強制更新します..."
  git fetch origin
  git reset --hard origin/main
  git clean -fd
fi

echo "🟡 update.sh に管理者権限を付与..."
chmod +x update.sh

echo "🟡 npm install を実行..."
npm install

echo "🟡 コマンドを更新（開発）"
node devcmd.js

echo "🟡 PM2 でアプリを起動または再起動..."
if pm2 describe svml_zimu_bot > /dev/null; then
  echo "🔁 svml_zimu_bot は既に起動済み。再起動します..."
  if ! pm2 restart svml_zimu_bot; then
    echo "⚠️ 再起動失敗。削除して再起動します..."
    pm2 delete svml_zimu_bot
    pm2 start ecosystem.config.js --only svml_zimu_bot
  fi
else
  echo "▶️ svml_zimu_bot を初回起動します..."
  pm2 start ecosystem.config.js --only svml_zimu_bot
fi

echo "🟢 PM2 状態を保存..."
pm2 save

# すでに startup 登録されている場合もあるので重複防止のため tail 実行を最後に
if ! pm2 startup | grep -q "sudo"; then
  echo "🟢 PM2 startup は既に設定済みです。"
else
  echo "🟢 PM2 startup を設定..."
  pm2 startup | tail -n 1 | bash
fi

echo "✅ セットアップ完了！PM2 により svml_zimu_bot が自動起動されます。"                                               