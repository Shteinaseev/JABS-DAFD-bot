
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Send server rules to a specific channel'),

    async execute(interaction) {
        const targetChannelId = '1197860679890239560'; // замените на ID вашего канала
        const targetChannel = interaction.client.channels.cache.get(targetChannelId);
        await interaction.reply('Эмбед был отправлен.');

        if (targetChannel) {
            await targetChannel.send({
                embeds: [{
                    color: 0x0099FF,
                    title: `Правила сервера JABS & DAFD`,
                    url: 'https://discord.gg/8Pxh49Kx',
                    description: `
                    **Наказания:**\n▫️предупреждение\n▫️блокировка сообщений(мут)\n▫️блокировка аккаунта(бан)\n🔹За 3 предупреждения, по разным пунктам правил, участник получает двухчасовой мут\n🔹За 3 предупреждения по одному и тому же пункту правил участник получает бан навсегда.\n🔹Использование доп.аккаунта во время наказания.\n
                    **Правила общения сервера JABS & DAFD**\n
                    1.Запрещены дискриминационные шутки, враждебные высказывания и их пропаганда.Массовые конфликты на почве расовой, религиозной, национальной и этнической принадлежностей.\n
                    ❕Наказание - блокировка сообщений от 60 минут/блокировка аккаунта навсегда\n
                    2.Запрещён спам/флуд/оффтоп в любых его проявлениях во всех каналах, а также чрезмерное употребление нецензурной лексики.\n
                    ❕Наказание - блокировка сообщений от 2ух часов.\n
                    3.Запрещена публикация материала, содержащего шокирующий или порнографический контент.\n
                    ❕Наказание - блокировка сообщений от 1го часа.\n
                    4. Запрещается цитировать личную переписку из привата или других средств общения одних участников форума с другими без явного согласия обеих сторон.\n
                    ❕Наказание - блокировка сообщений от 48 часов/блокировка аккаунта навсегда`,
                    footer: ({ text: `JABS & DAFD`, icon_url:'https://media.discordapp.net/attachments/1197983507016847472/1201954212158898218/image_processing20200803-21052-1lby35b.gif'})

                }]
            });
        }
    },
}