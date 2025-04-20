const { EmbedBuilder } = require('discord.js');
const { DEVELOPER_FOOTER } = require('../utils/developerCheck');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // KOMUTLAR
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                console.log(`${interaction.user.tag} komutu kullandı: /${interaction.commandName}`);
                await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Komut Hatası')
                    .setDescription('Komut çalıştırılırken bir hata oluştu!')
                    .addFields(
                        { name: 'Komut', value: interaction.commandName, inline: true },
                        { name: 'Hata', value: error.message, inline: true }
                    )
                    .setFooter({ 
                        text: 'Developer by Voltacik',
                        iconURL: client.user.displayAvatarURL()
                    });

                if (!interaction.replied) {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }

        // BUTONLAR
        if (interaction.isButton()) {
            const queue = client.player?.nodes?.get(interaction.guildId);
            if (!queue) return;

            try {
                console.log(`${interaction.user.tag} butona tıkladı: ${interaction.customId}`);

                switch (interaction.customId) {
                    case 'pause':
                        queue.node.setPaused(!queue.node.isPaused());
                        await interaction.update({
                            content: queue.node.isPaused() ? '⏸️ Müzik duraklatıldı' : '▶️ Müzik devam ediyor',
                            ephemeral: true
                        });
                        break;

                    case 'skip':
                        if (!queue.tracks.length) {
                            return interaction.reply({
                                content: '❌ Atlanacak şarkı yok!',
                                ephemeral: true
                            });
                        }
                        queue.node.skip();
                        await interaction.update({
                            content: '⏭️ Şarkı atlandı',
                            ephemeral: true
                        });
                        break;

                    case 'stop':
                        queue.delete();
                        await interaction.update({
                            content: '⏹️ Müzik durduruldu ve sıra temizlendi',
                            ephemeral: true
                        });
                        break;

                    case 'volumeUp':
                        if (queue.node.volume >= 200) {
                            return interaction.reply({
                                content: '❌ Maksimum ses seviyesine ulaşıldı!',
                                ephemeral: true
                            });
                        }
                        queue.node.setVolume(queue.node.volume + 10);
                        await interaction.update({
                            content: `🔊 Ses seviyesi: ${queue.node.volume}%`,
                            ephemeral: true
                        });
                        break;

                    case 'volumeDown':
                        if (queue.node.volume <= 0) {
                            return interaction.reply({
                                content: '❌ Minimum ses seviyesine ulaşıldı!',
                                ephemeral: true
                            });
                        }
                        queue.node.setVolume(queue.node.volume - 10);
                        await interaction.update({
                            content: `🔉 Ses seviyesi: ${queue.node.volume}%`,
                            ephemeral: true
                        });
                        break;

                    case 'lyrics':
                        const lyricsCommand = client.commands.get('lyrics');
                        if (lyricsCommand) {
                            await lyricsCommand.execute(interaction, client);
                        }
                        break;
                }
            } catch (error) {
                console.error(error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Buton Hatası')
                    .setDescription('Buton işlenirken bir hata oluştu!')
                    .addFields(
                        { name: 'Buton', value: interaction.customId, inline: true },
                        { name: 'Hata', value: error.message, inline: true }
                    )
                    .setFooter({ 
                        text: 'Developer by Voltacik',
                        iconURL: client.user.displayAvatarURL()
                    });

                if (!interaction.replied) {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }
    }
};
