const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
data: new SlashCommandBuilder()
.setName('move')
.setDescription('Sıradaki şarkının yerini değiştirir')
.addIntegerOption(option =>
option.setName('eski')
.setDescription('Taşınacak şarkının mevcut sırası')
.setRequired(true))
.addIntegerOption(option =>
option.setName('yeni')
.setDescription('Şarkının yeni sırası')
.setRequired(true)),
async execute(interaction, client) {
const queue = client.player.nodes.get(interaction.guildId);
if (!queue || !queue.tracks.length) {
return interaction.reply({ content: '❌ Sırada şarkı yok!', ephemeral: true });
}

const oldIndex = interaction.options.getInteger('eski') - 1;
const newIndex = interaction.options.getInteger('yeni') - 1;

if (oldIndex < 0 || oldIndex >= queue.tracks.length || 
newIndex < 0 || newIndex >= queue.tracks.length) {
return interaction.reply({ 
content: `❌ Geçersiz sıra numarası! (1-${queue.tracks.length})`, 
ephemeral: true 
});
}

const track = queue.tracks.at(oldIndex);
queue.tracks.remove(oldIndex);
queue.tracks.insert(newIndex, track);

const embed = new EmbedBuilder()
.setColor('#0099ff')
.setTitle('🔄 Şarkı Taşındı')
.setDescription(`**${track.title}** ${oldIndex + 1}. sıradan ${newIndex + 1}. sıraya taşındı.`)
.addFields(
{ name: 'Kanal', value: track.author, inline: true },
{ name: 'Süre', value: track.duration, inline: true }
)
.setFooter({ 
 text: `İsteyen: ${interaction.user.username} • Developer by Voltacik`,
 iconURL: interaction.user.displayAvatarURL()
});

await interaction.reply({ embeds: [embed] });
}
}; 