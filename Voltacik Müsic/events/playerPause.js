const { EmbedBuilder } = require('discord.js');
module.exports = {
name: 'playerPause',
async execute(queue) {
const embed = new EmbedBuilder()
.setColor('#ffa500')
.setTitle('⏸️ Müzik Duraklatıldı')
.setDescription(`**${queue.currentTrack.title}** duraklatıldı.`)
.addFields(
{ name: 'Kanal', value: queue.currentTrack.author, inline: true },
{ name: 'Süre', value: queue.currentTrack.duration, inline: true }
)
.setFooter({ 
 text: `İsteyen: ${queue.currentTrack.requestedBy.username} • Developer by Voltacik`,
 iconURL: queue.currentTrack.requestedBy.displayAvatarURL()
});

queue.metadata.channel.send({ embeds: [embed] });
}
}; 