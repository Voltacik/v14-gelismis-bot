const { EmbedBuilder } = require('discord.js');

module.exports = {
 name: 'guildCreate',
 async execute(guild, client) {
  const owner = await guild.fetchOwner();
  const embed = new EmbedBuilder()
.setColor('#00ff00')
.setTitle('🎵 Voltacik Müzik Botu')
.setDescription('Sunucunuza hoş geldim! İşte benim özelliklerim:')
.addFields(
 { name: 'Müzik Komutları', value: '`/play` - Müzik çalar\n`/queue` - Sırayı gösterir\n`/lyrics` - Şarkı sözlerini gösterir\n`/volume` - Ses seviyesini ayarlar\n`/loop` - Döngü modunu ayarlar\n`/shuffle` - Sırayı karıştırır\n`/nowplaying` - Çalan şarkıyı gösterir\n`/clear` - Sırayı temizler', inline: true },
 { name: 'Özellikler', value: '🎵 Yüksek kaliteli müzik\n🎵 Şarkı sözleri desteği\n🎵 Butonlu kontrol paneli\n🎵 Otomatik ses kanalı yönetimi\n🎵 Türkçe komutlar ve mesajlar', inline: true }
)
.setFooter({ 
 text: 'Developer by Voltacik',
 iconURL: client.user.displayAvatarURL()
});

  try {
await owner.send({ embeds: [embed] });
  } catch (error) {
console.error(`Sunucu sahibine mesaj gönderilemedi: ${guild.name}`);
  }

  
  console.log(`Yeni sunucuya katıldım: ${guild.name} (${guild.id})`);
 }
}; 