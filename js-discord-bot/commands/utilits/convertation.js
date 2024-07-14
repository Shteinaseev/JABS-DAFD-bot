
const { SlashCommandBuilder } = require('discord.js');
const { getUserScore, saveUserScore } = require('../../scoreUtils.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('convertation')
		.setDescription('Converts the score to the servers original currency')
        .addNumberOption(option =>
            option.setName('sum')
                .setDescription('Enter the amount you want to convert')
                .setRequired(true)),

	async execute(interaction) {
        const userId = interaction.user.id;
        let { score } = await getUserScore(userId);
        const amount = interaction.options.getNumber('sum');
        if (score < amount) {
            return interaction.reply({
                content: 'Ошибка: у вас недостаточно средств для выполнения конвертации.',
                ephemeral: true
            });
        }
        score -= amount
        const targetChannelId = '1197860679890239562'; // замените на ID вашего канала
        const targetChannel = interaction.client.channels.cache.get(targetChannelId);
        await interaction.reply({
            embeds: [{
                color: 0x0099FF,
                title: `Ваша сумма: ${amount}`,
                url: 'https://discord.gg/8Pxh49Kx',
                description:` > **Ваш запрос успешно отпрален.**`,
                footer: ({ text: `Ожидайте ответа тех.админа.` })
            }]
        });
        await saveUserScore(userId, score);


        if (targetChannel) {
            const userAvatar = interaction.user.displayAvatarURL({ dynamic: true, size: 1024 });
            await targetChannel.send({
                embeds: [{
                    color: 0x0099FF,
                    title: `Плательщик: ${interaction.user.username}`,
                    description: `**Запрос на конвертацию данной суммы в тугрик.**\n***Переведите значение на счёт Juniper bot.***`,
                    url: 'https://discord.gg/8Pxh49Kx',
                    fields: [
                        { name: 'Сумма', value: amount},
                    ],
                    thumbnail: {url: userAvatar},
                    footer: ({ text: `Чтобы перевести значение воспользуйтесь командой /transfer` })
                }]
            });
        }    
	},
};