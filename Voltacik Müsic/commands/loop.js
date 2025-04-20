const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
data: new SlashCommandBuilder()
.setName('loop')
.setDescription('Müzik döngüsünü ayarlar')
.addStringOption(option =>
option.setName('mod')
.setDescription('Döngü modu')
.setRequired(true)
.addChoices(
{ name: 'Kapalı', value: '0' },
{ name: 'Sıra', value: '1' },
{ name: 'Şarkı', value: '2' }
)),
async execute(interaction, client) {
const queue = client.player.nodes.get(interaction.guildId);
if (!queue) {
return interaction.reply({ content: '❌ Şu anda çalan müzik yok!', ephemeral: true });
}

const mode = parseInt(interaction.options.getString('mod'));
queue.setRepeatMode(mode);

const modes = ['Kapalı', 'Sıra', 'Şarkı'];
const embed = new EmbedBuilder()
.setColor('#0099ff')
.setTitle('🔄 Döngü Modu')
.setDescription(`Döngü modu **${modes[mode]}** olarak ayarlandı.`)
.setFooter({ 
 text: `İsteyen: ${interaction.user.username} • Developer by Voltacik`,
 iconURL: interaction.user.displayAvatarURL()
});

await interaction.reply({ embeds: [embed] });
}
}; 