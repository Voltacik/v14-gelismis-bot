const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Müzik sırasını gösterir'),
    cooldown: 3,

    async execute(interaction, client, player) {
        // Player kontrolü
        if (!player) {
            return interaction.reply({
                content: '❌ Müzik sistemi başlatılamadı. Bot yeniden başlatılmış olabilir.',
                ephemeral: true
            });
        }

        const queue = player.nodes.get(interaction.guildId);
        if (!queue || !queue.currentTrack || queue.tracks.size === 0) {
            return interaction.reply({
                content: '❌ Sırada şarkı yok!',
                ephemeral: true
            });
        }

        const tracks = queue.tracks.toArray().map((track, i) =>
            `${i + 1}. **${track.title}** - ${track.author} (${formatDuration(track.duration)})`
        );

        const chunkSize = 10;
        const pages = [];
        for (let i = 0; i < tracks.length; i += chunkSize) {
            pages.push(tracks.slice(i, i + chunkSize));
        }

        let currentPage = 0;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Müzik Sırası')
            .setDescription(
                `**Şu anda çalan:**\n${queue.currentTrack.title} - ${queue.currentTrack.author} (${formatDuration(queue.currentTrack.duration)})\n\n` +
                `**Sıradaki şarkılar:**\n${pages[currentPage].join('\n')}`
            )
            .setFooter({ 
                text: `Sayfa ${currentPage + 1}/${pages.length} • Developer by Voltacik`,
                iconURL: interaction.user.displayAvatarURL()
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('◀️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('▶️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === pages.length - 1)
        );

        const message = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: '❌ Bu butonları sadece komutu kullanan kişi kullanabilir!',
                    ephemeral: true
                });
            }

            if (i.customId === 'prev') currentPage--;
            if (i.customId === 'next') currentPage++;

            embed.setDescription(
                `**Şu anda çalan:**\n${queue.currentTrack.title} - ${queue.currentTrack.author} (${formatDuration(queue.currentTrack.duration)})\n\n` +
                `**Sıradaki şarkılar:**\n${pages[currentPage].join('\n')}`
            ).setFooter({ 
                text: `Sayfa ${currentPage + 1}/${pages.length} • Developer by Voltacik`,
                iconURL: interaction.user.displayAvatarURL()
            });

            row.components[0].setDisabled(currentPage === 0);
            row.components[1].setDisabled(currentPage === pages.length - 1);

            await i.update({ embeds: [embed], components: [row] });
        });

        collector.on('end', () => {
            message.edit({ components: [] });
        });
    }
};

function formatDuration(duration) {
    if (isNaN(duration) || duration <= 0) return 'Bilinmiyor';
    const totalSeconds = duration / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
