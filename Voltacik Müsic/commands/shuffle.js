const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Müzik sırasını karıştırır'),
    async execute(interaction, client) {
        const queue = client.player.nodes.get(interaction.guildId);
        if (!queue || !queue.tracks.length) {
            return interaction.reply({ content: '❌ Karıştırılacak şarkı yok!', ephemeral: true });
        }

        queue.tracks.shuffle();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🔀 Sıra Karıştırıldı')
            .setDescription(`**${queue.tracks.length}** şarkı karıştırıldı.`)
            .setFooter({ 
                text: `İsteyen: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    }
}; 