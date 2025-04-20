const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    name: 'trackAdd',
    async execute(queue, track) {
        try {
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎵 Şarkı Eklendi')
                .setDescription(`**${track.title}** sıraya eklendi.`)
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
            logger.info(`Şarkı eklendi: ${track.title}`);
        } catch (error) {
            logger.error('TrackAdd event hatası:', error);
        }
    }
};
