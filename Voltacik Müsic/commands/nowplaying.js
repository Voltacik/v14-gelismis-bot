const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { DEVELOPER_FOOTER } = require('../utils/developerCheck');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Şu anda çalan şarkıyı gösterir'),

    async execute(interaction, client) {
        const queue = client.player.nodes.get(interaction.guildId);
        if (!queue || !queue.currentTrack) {
            return interaction.reply({ content: '❌ Şu anda çalan şarkı yok!', ephemeral: true });
        }

        await interaction.reply({ content: '🎶 Şarkı bilgisi yükleniyor...', fetchReply: true });

        const updateProgress = async () => {
            const track = queue.currentTrack;
            const isLive = track.isLive;
            
            // Süre bilgilerini al
            const duration = track.durationMS;
            const currentTime = queue.node.getTimestamp()?.current || 0;
            
            // İlerleme çubuğu oluştur
            const progress = isLive
                ? '🔴 Canlı Yayın'
                : createProgressBar(currentTime, duration);

            // Süre formatlaması
            const trackDuration = isLive
                ? '🔴 Canlı Yayın'
                : formatDuration(duration);

            const currentTimeFormatted = isLive
                ? '🔴 Canlı Yayın'
                : formatDuration(currentTime);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎵 Şu Anda Çalıyor')
                .setDescription(`**${track.title}**`)
                .setThumbnail(track.thumbnail || null)
                .addFields(
                    { name: '🎤 Sanatçı', value: track.author, inline: true },
                    { name: '⏱️ Toplam Süre', value: trackDuration, inline: true },
                    { name: '⏳ Geçen Süre', value: currentTimeFormatted, inline: true },
                    { name: '🔗 URL', value: `[Tıkla](${track.url})`, inline: true },
                    { name: '📊 İlerleme', value: progress, inline: false },
                    { name: '🎵 Ses Seviyesi', value: `${queue.node.volume}%`, inline: true },
                    { name: '🔄 Döngü Modu', value: getRepeatMode(queue.repeatMode), inline: true }
                )
                .setFooter({
                    text: `İsteyen: ${track.requestedBy.username} • Developer by Voltacik`,
                    iconURL: track.requestedBy.displayAvatarURL()
                });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('lyrics')
                        .setLabel('🎵 Şarkı Sözleri')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.editReply({ 
                embeds: [embed],
                components: [row]
            });
        };

        // İlk güncelleme
        await updateProgress();

        // Her 5 saniyede bir güncelle
        const interval = setInterval(() => {
            if (!queue || !queue.currentTrack) {
                clearInterval(interval);
                return;
            }
            updateProgress();
        }, 5000);

        // Mesaj silindiğinde interval'i temizle
        interaction.client.on('interactionDelete', () => {
            clearInterval(interval);
        });

        // Buton etkileşimi
        const collector = interaction.channel.createMessageComponentCollector({
            time: 60000
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'lyrics') {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ 
                        content: '❌ Bu butonu sadece komutu kullanan kişi kullanabilir!', 
                        ephemeral: true 
                    });
                }
                
                try {
                    const lyricsCommand = client.commands.get('lyrics');
                    if (lyricsCommand) {
                        await lyricsCommand.execute(i, client);
                    }
                } catch (error) {
                    console.error('Şarkı sözleri butonu hatası:', error);
                    await i.reply({
                        content: '❌ Şarkı sözleri alınırken bir hata oluştu.',
                        ephemeral: true
                    });
                }
            }
        });
    }
};

function formatDuration(duration) {
    if (!duration || isNaN(duration)) return 'Bilinmiyor';

    const totalSeconds = Math.floor(duration / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function createProgressBar(currentMS, totalMS) {
    if (!currentMS || !totalMS || isNaN(currentMS) || isNaN(totalMS)) {
        return 'Bilinmiyor';
    }

    const barLength = 20;
    const progress = Math.min(Math.round((currentMS / totalMS) * barLength), barLength);
    const bar = '▬'.repeat(progress) + '🔘' + '▬'.repeat(barLength - progress);

    const current = formatDuration(currentMS);
    const total = formatDuration(totalMS);

    return `[${bar}] \`${current} / ${total}\``;
}

function getRepeatMode(mode) {
    switch (mode) {
        case 0: return 'Kapalı';
        case 1: return 'Sıra';
        case 2: return 'Şarkı';
        default: return 'Bilinmiyor';
    }
}
