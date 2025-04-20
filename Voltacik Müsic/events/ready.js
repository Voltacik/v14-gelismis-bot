const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} olarak giriş yapıldı!`);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Bot Hazır')
            .setDescription('Bot başarıyla başlatıldı ve çalışıyor!')
            .setFooter({ 
                text: 'Developer by Voltacik',
                iconURL: client.user.displayAvatarURL()
            });

        // Bot'un bulunduğu tüm sunucularda durum mesajını gönder
        for (const guild of client.guilds.cache.values()) {
            const systemChannel = guild.systemChannel;
            if (systemChannel) {
                try {
                    await systemChannel.send({ embeds: [embed] });
                } catch (error) {
                    console.error(`${guild.name} sunucusunda durum mesajı gönderilemedi:`, error);
                }
            }
        }

        client.user.setPresence({
            activities: [{ name: '🎵 Müzik Çalıyor', type: 0 }],
            status: 'dnd' // 'online', 'idle', 'dnd', 'invisible'
        });
    }
};
