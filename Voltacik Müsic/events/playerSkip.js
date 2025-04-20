const { EmbedBuilder } = require('discord.js');
module.exports = {
 name: 'playerSkip',
 async execute(queue, track) {
  const embed = new EmbedBuilder()
.setColor('#ff00ff')
.setTitle('⏭️ Şarkı Atlandı')
.setDescription(`**${track.title}** atlandı.`)
.addFields(
 { name: 'Kanal', value: track.author, inline: true },
 { name: 'Süre', value: track.duration, inline: true }
)
.setFooter({
 text: `İsteyen: ${track.requestedBy.username} • Developer by Voltacik`,
 iconURL: track.requestedBy.displayAvatarURL()
});

  queue.metadata.channel.send({ embeds: [embed] });
 }
};