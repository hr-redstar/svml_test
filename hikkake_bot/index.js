// 他のモジュール読み込み例
const hikkakeModals = require('./hikkake_bot/utils/hikkake_modals');
const hikkakeButtons = require('./hikkake_bot/utils/hikkake_buttons');  // ここに追加

// 使い方例（読み込み成功確認用）
console.log('hikkake_buttons.js 読み込み成功:', !!hikkakeButtons);

// あなたの既存コードに合わせて、hikkakeButtonsの関数やオブジェクトを利用してください。

// 例：exportされているボタンコンポーネントをinteractionCreateなどで使う
// client.on('interactionCreate', async interaction => {
//   if (interaction.isButton()) {
//     if (interaction.customId === hikkakeButtons.someButtonId) {
//       // ボタン押下処理
//     }
//   }
// });

module.exports = {
  // 必要に応じてexportsに含める
  hikkakeModals,
  hikkakeButtons,
  // 他モジュールなど
};
