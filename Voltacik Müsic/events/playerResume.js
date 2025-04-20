const { EmbedBuilder } = require('discord.js');
module.exports = {
name: 'playerResume',
async execute(queue) {
const embed = new EmbedBuilder()
.setColor('#00ff00')
.setTitle('▶️ Müzik Devam Ediyor')
.setDescription(`**${queue.currentTrack.title}** devam ediyor.`)
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