const { EmbedBuilder } = require('discord.js');
module.exports = {
 name: 'playerFinish',
 async execute(queue, track) {
  if (queue.tracks.length > 0) {
const nextTrack = queue.tracks[0];
const embed = new EmbedBuilder()
 .setColor('#00ff00')
 .setTitle('✅ Şarkı Bitti')
 .setDescription(`Sıradaki şarkı: **${nextTrack.title}**`)
 .setThumbnail(nextTrack.thumbnail)
 .addFields(
  { name: 'Kanal', value: nextTrack.author, inline: true },
  { name: 'Süre', value: nextTrack.duration, inline: true }
 )
 .setFooter({ 
  text: `İsteyen: ${nextTrack.requestedBy.username} • Developer by Voltacik`,
  iconURL: nextTrack.requestedBy.displayAvatarURL()
 });

queue.metadata.channel.send({ embeds: [embed] });
  } else {
const embed = new EmbedBuilder()
 .setColor('#ff0000')
 .setTitle('⏹️ Sıra Bitti')
 .setDescription('Tüm şarkılar çalındı! Yeni şarkı eklemek için `/play` komutunu kullanın.')
 .setFooter({ 
  text: 'Developer by Voltacik',
  iconURL: queue.metadata.channel.guild.members.me.displayAvatarURL()
 });

queue.metadata.channel.send({ embeds: [embed] });
  }
 }
};