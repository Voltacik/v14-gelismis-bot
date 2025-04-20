const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
 data: new SlashCommandBuilder()
  .setName('remove')
  .setDescription('Sıradan şarkı kaldırır')
  .addIntegerOption(option =>
option.setName('sıra')
 .setDescription('Kaldırılacak şarkının sırası')
 .setRequired(true)),
 async execute(interaction, client) {
  const queue = client.player.nodes.get(interaction.guildId);
  if (!queue || !queue.tracks.length) {
return interaction.reply({ content: '❌ Sırada şarkı yok!', ephemeral: true });
  }

  const index = interaction.options.getInteger('sıra') - 1;
  if (index < 0 || index >= queue.tracks.length) {
return interaction.reply({ 
 content: `❌ Geçersiz sıra numarası! (1-${queue.tracks.length})`, 
 ephemeral: true 
});
  }

  const removedTrack = queue.tracks.at(index);
  queue.tracks.remove(index);

  const embed = new EmbedBuilder()
.setColor('#0099ff')
.setTitle('🗑️ Şarkı Kaldırıldı')
.setDescription(`**${removedTrack.title}** sıradan kaldırıldı.`)
.addFields(
 { name: 'Kanal', value: removedTrack.author, inline: true },
 { name: 'Süre', value: removedTrack.duration, inline: true }
)
.setFooter({ 
 text: `İsteyen: ${interaction.user.username} • Developer by Voltacik`,
 iconURL: interaction.user.displayAvatarURL()
});

  await interaction.reply({ embeds: [embed] });
 }
}; 