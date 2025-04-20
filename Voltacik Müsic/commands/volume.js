const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Müzik ses seviyesini ayarlar')
        .addIntegerOption(option =>
            option.setName('seviye')
                .setDescription('Ses seviyesi (0-200)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(200)),
    async execute(interaction, client) {
        const queue = client.player.nodes.get(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: '❌ Şu anda çalan müzik yok!', ephemeral: true });
        }

        const volume = interaction.options.getInteger('seviye');
        queue.node.setVolume(volume);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🔊 Ses Seviyesi')
            .setDescription(`Ses seviyesi **${volume}%** olarak ayarlandı.`)
            .setFooter({
                text: `İsteyen: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    }
};