// hikkake_bot/utils/hikkake_select_handler.js

const purakamaSelectHandler = require('./hikkakePurakamaSelect');
const orderSelectHandler = require('./hikkakeOrderSelect');
const casualSelectHandler = require('./hikkakeCasualSelect');

// 今後、他のセレクトメニュー処理が増えた場合はここに追加する
const handlers = [
  purakamaSelectHandler,
  orderSelectHandler,
  casualSelectHandler,
];

module.exports = {
  /**
   * hikkake_bot関連のセレクトメニューインタラクションを統括して処理する
   * @param {import('discord.js').StringSelectMenuInteraction} interaction 
   * @returns {Promise<boolean>} 処理したらtrue、未処理ならfalse
   */
  async execute(interaction) {
    if (!interaction.isStringSelectMenu() || !interaction.customId.startsWith('hikkake_')) return false;

    // 対応するハンドラを探して処理を委譲
    for (const handler of handlers) {
      if (handler.customId.test(interaction.customId)) {
        await handler.handle(interaction);
        return true; // 処理したのでtrueを返す
      }
    }
    return false; // どのハンドラにもマッチしなかった
  }
};