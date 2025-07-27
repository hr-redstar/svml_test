// hikkake_bot/index.js

/**
 * hikkake_botのユーティリティモジュールまとめ読み込み
 */

const hikkakeModals = require('./utils/hikkake_modals');
const hikkakeButtons = require('./utils/hikkake_buttons');

/*
// 【開発時のみ】読み込み成功確認ログ
console.log('hikkakeButtons 読み込み成功:', !!hikkakeButtons);
*/

/**
 * 例: interactionCreateイベントでのボタン押下時の処理例
 * 
 * client.on('interactionCreate', async (interaction) => {
 *   if (interaction.isButton()) {
 *     // 例えばカスタムIDで判定
 *     if (interaction.customId === 'hikkake_quest_plakama') {
 *       // hikkakeButtons の関数呼び出しなど
 *     }
 *   }
 * });
 */

module.exports = {
  hikkakeModals,
  hikkakeButtons,
};
