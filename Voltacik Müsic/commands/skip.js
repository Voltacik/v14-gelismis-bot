const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Şarkıyı atlar'),
    cooldown: 3,
    async execute(interaction, client) {
        const queue = client.player.nodes.get(interaction.guildId);
        if (!queue || !queue.currentTrack) {
            return interaction.reply({ 
                content: '❌ Şu anda çalan müzik yok!', 
                flags: 64 // 64 = Ephemeral
            });
        }

        const currentTrack = queue.currentTrack;
        queue.node.skip();

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('⏭️ Şarkı Atlandı')
            .setDescription(`**${currentTrack.title}** atlandı.`)
            .addFields(
                { name: 'Kanal', value: currentTrack.author, inline: true },
                { name: 'Süre', value: currentTrack.duration, inline: true }
            )
            .setThumbnail(currentTrack.thumbnail || null)
            .setFooter({ 
                text: `İsteyen: ${interaction.user.username} • Developer by Voltacik`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    }
}; 