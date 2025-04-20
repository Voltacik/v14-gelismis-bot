const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Müzik sırasını temizler'),
    async execute(interaction, client) {
        const queue = client.player.nodes.get(interaction.guildId);
        if (!queue || !queue.tracks.length) {
            return interaction.reply({ content: '❌ Temizlenecek şarkı yok!', ephemeral: true }); }
        const count = queue.tracks.length;
        queue.tracks.clear();
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🗑️ Sıra Temizlendi')
            .setDescription(`**${count}** şarkı sıradan kaldırıldı.`)
            .setFooter({ 
                text: `İsteyen: ${interaction.user.username} • Developer by Voltacik`,
                iconURL: interaction.user.displayAvatarURL() });
        await interaction.reply({ embeds: [embed] });}
}; 