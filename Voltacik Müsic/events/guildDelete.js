const { EmbedBuilder } = require('discord.js');

module.exports = {
 name: 'guildDelete',
 async execute(guild, client) {
  const embed = new EmbedBuilder()
.setColor('#ff0000')
.setTitle('❌ Sunucudan Ayrıldım')
.setDescription(`**${guild.name}** sunucusundan ayrıldım.`)
.setFooter({ 
 text: 'Developer by Voltacik',
 iconURL: client.user.displayAvatarURL()
});

  try {
await guild.systemChannel?.send({ embeds: [embed] });
  } catch (error) {
console.error(`Sunucuya mesaj gönderilemedi: ${guild.name}`);
  }

  console.log(`Sunucudan ayrıldım: ${guild.name} (${guild.id})`);
  

  const queue = client.player.nodes.get(guild.id);
  if (queue) {
queue.delete();
  }
 }
}; 