const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const queue = client?.player?.nodes?.get(oldState.guild.id);
        if (!queue) return;

        if (oldState.member.id === client.user.id && !newState.channelId) {
            queue.delete();
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⏹️ Müzik Durduruldu')
                .setDescription('Ses kanalından ayrıldım!')
                .setFooter({ 
                    text: 'Developer by Voltacik',
                    iconURL: client.user.displayAvatarURL()
                });

            if (queue?.metadata?.channel) {
                queue.metadata.channel.send({ embeds: [embed] }).catch(() => { });
            }

            return;
        }

        if (oldState.channelId === queue.channel?.id) {
            const members = oldState.channel?.members?.filter(member => !member.user.bot);
            if (!members || members.size === 0) {

                setTimeout(async () => {
                    const currentChannel = queue.channel;
                    const newMembers = currentChannel?.members?.filter(member => !member.user.bot);
                    if (!newMembers || newMembers.size === 0) {
                        queue.delete();
                        const embed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('⏹️ Müzik Durduruldu')
                            .setDescription('Ses kanalında kimse kalmadığı için ayrılıyorum!')
                            .setFooter({ 
                                text: 'Developer by Voltacik',
                                iconURL: client.user.displayAvatarURL()
                            });

                        if (queue?.metadata?.channel) {
                            queue.metadata.channel.send({ embeds: [embed] }).catch(() => { });
                        }
                    }
                }, 300000);
            }
        }
    }
};
