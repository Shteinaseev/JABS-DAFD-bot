
const { SlashCommandBuilder } = require('discord.js');
const { getUserScore } = require('../../scoreUtils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('statistics')
        .setDescription('View the Tetris statistics of the specified participant')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Участник, чью статистику вы хотите увидеть')
                .setRequired(true)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const { score, lines } = await getUserScore(user.id);

        await interaction.reply({
            embeds: [{
                color: 0x0099FF,
                title: `Статистика по тетрису ${user.username}`,
                url: 'https://discord.gg/8Pxh49Kx',
                fields: [
                    { name: 'Текущий счёт', value: String(score), inline: false },
                    { name: 'Максимум линий', value: String(lines), inline: false },
                ]
            }]
        });
    },
};
