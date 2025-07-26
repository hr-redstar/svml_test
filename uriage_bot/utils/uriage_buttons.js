// utils/uriage_buttons.js

const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} = require('discord.js');

module.exports = {
    async execute(interaction) {
        if (!interaction.isButton()) return false;

        // ボタンのIDが「sales_report」のとき
        if (interaction.customId === 'sales_report') {
            const modal = new ModalBuilder()
                .setCustomId('sales_report_modal')
                .setTitle('売上報告');

            const dateInput = new TextInputBuilder()
                .setCustomId('report_date')
                .setLabel('日付 (例: 7/23)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const totalInput = new TextInputBuilder()
                .setCustomId('report_total')
                .setLabel('総売り（半角数字）')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const cashInput = new TextInputBuilder()
                .setCustomId('report_cash')
                .setLabel('現金（半角数字）')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const cardInput = new TextInputBuilder()
                .setCustomId('report_card')
                .setLabel('カード（半角数字）')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const expenseInput = new TextInputBuilder()
                .setCustomId('report_expense')
                .setLabel('諸経費（半角数字）')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(dateInput),
                new ActionRowBuilder().addComponents(totalInput),
                new ActionRowBuilder().addComponents(cashInput),
                new ActionRowBuilder().addComponents(cardInput),
                new ActionRowBuilder().addComponents(expenseInput),
            );

            await interaction.showModal(modal);
            return true; // 処理したことを示す
        }

        return false; // 他のボタンの可能性があるため false を返す
    }
};
