// hikkake_bot/utils/hikkake_modal_handler.js

const plakamaSubmitHandler = require('./hikkakePlakamaSubmit');
const orderSubmitHandler = require('./hikkakeOrderSubmit');
const casualSubmitHandler = require('./hikkakeCasualSubmit');

// モーダルIDの正規表現と対応するハンドラのマップ
const handlers = [
  plakamaSubmitHandler,
  orderSubmitHandler,
  casualSubmitHandler,
];

module.exports = {
  /**
   * hikkake_bot関連のモーダル送信インタラクションを統括して処理する
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   * @returns {Promise<boolean>} 処理したらtrue、未処理ならfalse
   */
  async execute(interaction) {
    if (!interaction.isModalSubmit()) return false;

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