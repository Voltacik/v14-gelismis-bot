const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Müzik araması yapar')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Aranacak şarkı')
                .setRequired(true)),
    async execute(interaction, client) {
        const query = interaction.options.getString('query');
        const results = await client.player.search(query, {
            requestedBy: interaction.user
        });

        if (!results || !results.tracks.length) {
            return interaction.reply({ content: '❌ Sonuç bulunamadı!', ephemeral: true });
        }

        const tracks = results.tracks.slice(0, 5);
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🔍 Arama Sonuçları')
            .setDescription('Aşağıdaki şarkılardan birini seçin:')
            .addFields(
                tracks.map((track, i) => ({
                    name: `${i + 1}. ${track.title}`,
                    value: `Kanal: ${track.author}\nSüre: ${track.duration}`
                }))
            )
            .setFooter({ 
                text: `İsteyen: ${interaction.user.username} • Developer by Voltacik`,
                iconURL: interaction.user.displayAvatarURL()
            });

        const row = new ActionRowBuilder()
            .addComponents(
                tracks.map((track, i) => 
                    new ButtonBuilder()
                        .setCustomId(`select_${i}`)
                        .setLabel(`${i + 1}`)
                        .setStyle(ButtonStyle.Primary)
                )
            );

        const message = await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            fetchReply: true 
        });

        const collector = message.createMessageComponentCollector({ 
            time: 30000 
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ 
                    content: '❌ Bu seçim sadece komutu kullanan kişi tarafından yapılabilir!', 
                    ephemeral: true 
                });
            }

            const index = parseInt(i.customId.split('_')[1]);
            const selectedTrack = tracks[index];

            const queue = client.player.nodes.create(interaction.guild, {
                metadata: {
                    channel: interaction.channel,
                    client: interaction.guild.members.me,
                    requestedBy: interaction.user
                }
            });

            try {
                if (!queue.connection) await queue.connect(interaction.member.voice.channel);
            } catch {
                queue.delete();
                return i.reply({ content: '❌ Ses kanalına katılamadım!', ephemeral: true });
            }

            await queue.play(selectedTrack);
            await i.update({ 
                content: `✅ **${selectedTrack.title}** sıraya eklendi!`, 
                embeds: [], 
                components: [] 
            });
        });

        collector.on('end', () => {
            if (!message.deleted) {
                message.edit({ components: [] });
            }
        });
    }
}; 