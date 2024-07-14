const { Events, InteractionType } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.type === InteractionType.ModalSubmit) {
            if (interaction.customId === 'myModal') {
                const favoriteColor = interaction.fields.getTextInputValue('favoriteColorInput');
                const hobbies = interaction.fields.getTextInputValue('hobbiesInput');

                // ID канала, в который вы хотите отправить сообщение
                const channelId = '1197826791499378708';

                // Получение канала по ID и отправка сообщения
                const channel = await interaction.client.channels.fetch(channelId);
                if (channel) {
                    await channel.send(`Your favorite color is ${favoriteColor} and your hobbies are ${hobbies}`);
                    await interaction.reply({ content: 'Спасибо за предоставленную информацию!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Не удалось найти канал для отправки сообщения.', ephemeral: true });
                }
            }
        }
    },
};