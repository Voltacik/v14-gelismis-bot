const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Müziği durdurur ve sırayı temizler'),
    cooldown: 3,
    async execute(interaction, client) {
        const queue = client.player.nodes.get(interaction.guildId);
        if (!queue || !queue.currentTrack) {
            return interaction.reply({ 
                content: '❌ Şu anda çalan müzik yok!', 
                ephemeral: true 
            });
        }

        const currentTrack = queue.currentTrack;
        queue.delete();

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⏹️ Müzik Durduruldu')
            .setDescription('Müzik durduruldu ve sıra temizlendi.')
            .addFields(
                { name: 'Son Çalan Şarkı', value: currentTrack.title, inline: true },
                { name: 'Kanal', value: currentTrack.author, inline: true }
            )
            .setThumbnail(currentTrack.thumbnail)
            .setFooter({ 
                text: `İsteyen: ${interaction.user.username} • Developer by Voltacik`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    }
}; 