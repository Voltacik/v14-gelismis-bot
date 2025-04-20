const { EmbedBuilder } = require('discord.js');
const logger = require('./logger');

class PlayerManager {
    constructor(client) {
        this.client = client;
    }

    async createQueue(guild, channel, user) {
        try {
            const queue = this.client.player.nodes.create(guild, {
                metadata: {
                    channel: channel,
                    client: guild.members.me,
                    requestedBy: user
                },
                leaveOnEnd: false,
                leaveOnStop: false,
                leaveOnEmpty: true, // Ses kanalında kimse kalmadığında otomatik ayrılma
                leaveOnEmptyCooldown: 300000, // 5 dakika sonra ayrıl
                autoSelfDeaf: true,
                initialVolume: 100,
                bufferingTimeout: 3000,
                connectionTimeout: 30000
            });
    
            return queue;
        } catch (error) {
            logger.error('Kuyruk oluşturulurken hata oluştu:', error);
            return null;
        }
    }
    async connectToVoiceChannel(queue, channel) {
        try {
            if (!queue.connection) {
                await queue.connect(channel);
            }
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    async playTrack(queue, track) {
        try {
            await queue.play(track);
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    async skipTrack(queue) {
        try {
            await queue.node.skip();
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    async pauseQueue(queue) {
        try {
            queue.node.setPaused(true);
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    async resumeQueue(queue) {
        try {
            queue.node.setPaused(false);
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    async setVolume(queue, volume) {
        try {
            await queue.node.setVolume(volume);
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    async clearQueue(queue) {
        try {
            queue.delete();
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    async getQueueTracks(queue) {
        try {
            if (!queue || (!queue.currentTrack && !queue.tracks.length)) {
                return null;
            }

            const tracks = queue.tracks.map((track, index) => ({
                index: index + 1,
                title: track.title,
                author: track.author,
                duration: track.duration,
                url: track.url
            }));

            return {
                currentTrack: queue.currentTrack,
                tracks: tracks
            };
        } catch (error) {
            logger.error(error);
            return null;
        }
    }

    async selectTrack(queue, trackIndex) {
        try {
            if (!queue || trackIndex < 1 || trackIndex > queue.tracks.length) {
                return false;
            }

            const track = queue.tracks.splice(trackIndex - 1, 1)[0];
            queue.tracks.unshift(track); // Seçilen şarkıyı sıranın başına al
            await queue.node.skip(); // Mevcut şarkıyı atla ve seçilen şarkıyı çal
            return true;
        } catch (error) {
            logger.error(error);
            return false;
        }
    }

    createNowPlayingEmbed(track) {
        return new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎵 Şimdi Çalıyor')
            .setDescription(`**${track.title}**`)
            .addFields(
                { name: 'Kanal', value: track.author, inline: true },
                { name: 'Süre', value: track.duration, inline: true },
                { name: 'URL', value: `[Tıkla](${track.url})`, inline: true }
            )
            .setThumbnail(track.thumbnail)
            .setFooter({
                text: `İsteyen: ${track.requestedBy.username}`,
                iconURL: track.requestedBy.displayAvatarURL()
            });
    }
}

module.exports = PlayerManager;