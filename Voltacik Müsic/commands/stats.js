const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Bot istatistiklerini gösterir'),
    cooldown: 10,
    async execute(interaction, client) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📊 Bot İstatistikleri')
            .addFields(
                { 
                    name: '🕒 Çalışma Süresi', 
                    value: `${days} gün, ${hours} saat, ${minutes} dakika, ${seconds} saniye`,
                    inline: false 
                },
                { 
                    name: '💾 Bellek Kullanımı', 
                    value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
                    inline: true 
                },
                { 
                    name: '📈 Sunucu Sayısı', 
                    value: `${client.guilds.cache.size}`,
                    inline: true 
                },
                { 
                    name: '👥 Toplam Kullanıcı', 
                    value: `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`,
                    inline: true 
                },
                { 
                    name: '🎵 Aktif Ses Bağlantısı', 
                    value: `${client.player.nodes.size}`,
                    inline: true 
                },
                { 
                    name: '⚡ CPU Kullanımı', 
                    value: `${(process.cpuUsage().user / 1000000).toFixed(2)}%`,
                    inline: true 
                },
                { 
                    name: '🖥️ İşletim Sistemi', 
                    value: `${os.type()} ${os.release()}`,
                    inline: true 
                },
                { 
                    name: '📚 Discord.js Versiyonu', 
                    value: `v${require('discord.js').version}`,
                    inline: true 
                }
            )
            .setFooter({ 
                text: `İsteyen: ${interaction.user.username} • Developer by Voltacik`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    }
}; 