// hikkake_bot/utils/hikkake_modal_handler.js

const plakamaSubmitHandler = require('./hikkakePlakamaSubmit');
const orderSubmitHandler = require('./hikkakeOrderSubmit');
const casualSubmitHandler = require('./hikkakeCasualSubmit');

const handlers = [
  plakamaSubmitHandler,
  orderSubmitHandler,
  casualSubmitHandler,
];

module.exports = {
  /**
   * @param {import('discord.js').ModalSubmitInteraction} interaction
   * @returns {Promise<boolean>}
   */
  async execute(interaction) {
    if (!interaction.isModalSubmit() || !interaction.customId.startsWith('hikkake_')) return false;

    for (const handler of handlers) {
      if (handler.customId.test(interaction.customId)) {
        await handler.handle(interaction);
        return true;
      }
    }
    return false;
  }
};