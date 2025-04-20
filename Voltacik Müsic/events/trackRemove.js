const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: 'trackRemove',
    async execute(queue, track) {
        try {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Şarkı Kaldırıldı')
                .setDescription(`**${track.title}** sıradan kaldırıldı.`)
                .addFields(
                    { name: '🎤 Sanatçı', value: track.author, inline: true },
                    { name: '⏱️ Süre', value: track.duration, inline: true }
                )
                .setThumbnail(track.thumbnail)
                .setFooter({
                    text: `İsteyen: ${track.requestedBy.username} • Developer by Voltacik`,
                    iconURL: track.requestedBy.displayAvatarURL()
                });

            await queue.metadata.channel.send({ embeds: [embed] });
            logger.info(`Şarkı kaldırıldı: ${track.title}`);
        } catch (error) {
            logger.error('TrackRemove event hatası:', error);
        }
    }
};
