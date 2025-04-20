const { EmbedBuilder } = require('discord.js');
module.exports = {
 name: 'queueEnd',
 async execute(queue) {
  const embed = new EmbedBuilder()
.setColor('#ff0000')
.setTitle('⏹️ Müzik Bitti')
.setDescription('Ses kanalından ayrılıyorum! Yeni şarkı eklemek için `/play` komutunu kullanın.')
.setFooter({ 
 text: 'Developer by Voltacik',
 iconURL: queue.metadata.client.user.displayAvatarURL()
});

  await queue.metadata.channel.send({ embeds: [embed] });
  

  if (queue.connection) {
queue.connection.destroy();
  }
 }
}; 