const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
.setName('filter')
.setDescription('Müziğe efekt ekler veya filtreleri kaldırır')
.addStringOption(option =>
 option.setName('effect')
.setDescription('Eklenecek efekt veya "clear" ile filtreleri kaldırın')
.setRequired(true)
.addChoices(
{ name: 'Bass Boost', value: 'bassboost' },
{ name: '8D', value: '8d' },
{ name: 'Vaporwave', value: 'vaporwave' },
{ name: 'Nightcore', value: 'nightcore' },
{ name: 'Phaser', value: 'phaser' },
{ name: 'Tremolo', value: 'tremolo' },
{ name: 'Vibrato', value: 'vibrato' },
{ name: 'Reverse', value: 'reverse' },
{ name: 'Treble', value: 'treble' },
{ name: 'Normal', value: 'normal' },
{ name: 'Clear', value: 'clear' } 
)),
    cooldown: 3,
    async execute(interaction, client) {
const queue = client.player.nodes.get(interaction.guildId);
if (!queue || !queue.currentTrack) {
 return interaction.reply({
content: '❌ Şu anda çalan müzik yok!',
flags: 64 
 }); 
}

const effect = interaction.options.getString('effect');
let filter;

if (effect === 'clear') {
 filter = {}; 
} else {
 switch (effect) {
case 'bassboost':
filter = { bass: 'g=20,dynaudnorm=f=200' };
break;
case '8d':
filter = { apulsator: 'hz=0.08' };
break;
case 'vaporwave':
filter = { aresample: '48000,asetrate=48000*0.8' };
break;
case 'nightcore':
filter = { aresample: '48000,asetrate=48000*1.25' };
break;
case 'phaser':
filter = { aphaser: 'in_gain=0.4' };
break;
case 'tremolo':
filter = { tremolo: '' };
break;
case 'vibrato':
filter = { vibrato: 'f=6.5' };
break;
case 'reverse':
filter = { areverse: '' };
break;
case 'treble':
filter = { treble: 'g=5' };
break;
case 'normal':
filter = {}; 
break;
 }
}
try {
 await queue.filters.ffmpeg.setFilters(filter);

 const embed = new EmbedBuilder()
.setColor('#0099ff')
.setTitle('🎛️ Efekt Uygulandı')
.setDescription(effect === 'clear' ? 'Filtreler kaldırıldı.' : `**${effect}** efekti uygulandı.`)
.addFields(
{ name: 'Şarkı', value: queue.currentTrack.title, inline: true },
{ name: 'Kanal', value: queue.currentTrack.author, inline: true }
)
.setThumbnail(queue.currentTrack.thumbnail)
.setFooter({ 
 text: `İsteyen: ${interaction.user.username} • Developer by Voltacik`,
 iconURL: interaction.user.displayAvatarURL()
});

 await interaction.reply({ embeds: [embed] });
} catch (error) {
 console.error('Filter error:', error);
 return interaction.reply({
content: '❌ Efekt uygulanırken bir hata oluştu!',
flags: 64 
 }); 
}}
};
