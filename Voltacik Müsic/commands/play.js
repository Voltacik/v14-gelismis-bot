const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Bir şarkı çal')
    .addStringOption(option =>
      option.setName('şarkı')
        .setDescription('Çalınacak şarkının adı veya linki')
        .setRequired(true)
    ),

  async execute(interaction) {
    const player = useMainPlayer();
    const query = interaction.options.getString('şarkı');
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply({
        content: '🎧 | Önce bir ses kanalına katılmalısın.',
        ephemeral: true
      });
    }

    await interaction.deferReply(); // Yanıtı erteleme

    const searchResult = await player.search(query, {
      requestedBy: interaction.user
    });

    if (!searchResult.hasTracks()) {
      return interaction.editReply({
        content: '❌ | Şarkı bulunamadı.'
      });
    }

    const queue = await player.nodes.create(interaction.guild, {
      metadata: {
        channel: interaction.channel
      },
      selfDeaf: true,
      volume: 80
    });

    try {
      if (!queue.connection) await queue.connect(channel);
    } catch {
      queue.delete();
      return interaction.editReply({ content: '❌ | Ses kanalına bağlanılamadı.' });
    }

    const track = searchResult.tracks[0];
    await queue.addTrack(track);
    if (!queue.isPlaying()) queue.node.play();

    const upcomingTracks = queue.tracks.toArray().slice(0, 5).map((t, i) => `\`${i + 1}.\` [${t.title}](${t.url})`).join('\n') || '🎵 | Kuyrukta başka şarkı yok.';
    const listeners = queue.channel?.members
      ?.filter(member => !member.user.bot)
      ?.map(member => `<@${member.id}>`)
      .join(', ') || 'Kimse yok';

    const embed = new EmbedBuilder()
      .setTitle(`🎶 | Çalınıyor: [${track.title}](${track.url})`)
      .setDescription(`🎤 **Sanatçı:** ${track.author}\n⏱️ **Süre:** ${track.duration}\n\n📄 **Kuyruk:**\n${upcomingTracks}\n\n👥 **Dinleyenler:**\n${listeners}`)
      .setColor('#00ffe4')
      .setTimestamp()
      .setFooter({ 
        text: `İsteyen: ${interaction.user.username} • Developer by Voltacik`,
        iconURL: interaction.user.displayAvatarURL()
      });

    if (track.thumbnail && track.thumbnail.startsWith('http')) {
      embed.setThumbnail(track.thumbnail);
    }

    // Butonlar
    const kontrolPanel = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('pause')
        .setLabel('⏸️ Duraklat')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('resume')
        .setLabel('▶️ Devam')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('skip')
        .setLabel('⏭️ Atla')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('stop')
        .setLabel('⏹️ Durdur')
        .setStyle(ButtonStyle.Danger),
    );

    const sesPanel = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('volume_up')
        .setLabel('🔊 Yükselt')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('volume_down')
        .setLabel('🔈 Kıs')
        .setStyle(ButtonStyle.Secondary)
    );

    const message = await interaction.editReply({
      embeds: [embed],
      components: [kontrolPanel, sesPanel]
    });

    // Buton etkileşimleri
    const collector = message.createMessageComponentCollector({
      time: track.durationMS || 180000,
      filter: (i) => i.user.id === interaction.user.id
    });

    collector.on('collect', async i => {
      if (!queue || !queue.connection) {
        return i.reply({ content: '❌ | Aktif bir oynatma kuyruğu yok.', ephemeral: true });
      }

      // Yanıt verildi mi kontrol et
      if (i.replied || i.deferred) return;

      switch (i.customId) {
        case 'pause':
          queue.node.setPaused(true);
          return i.reply({ content: '⏸️ | Şarkı duraklatıldı.', ephemeral: true });
        case 'resume':
          queue.node.setPaused(false);
          return i.reply({ content: '▶️ | Şarkı devam ediyor.', ephemeral: true });
        case 'skip':
          queue.node.skip();
          return i.reply({ content: '⏭️ | Şarkı atlandı.', ephemeral: true });
        case 'stop':
          queue.delete();
          return i.reply({ content: '⏹️ | Oynatma durduruldu.', ephemeral: true });
        case 'volume_up':
          let volumeUp = queue.node.volume + 10;
          if (volumeUp > 100) volumeUp = 100;
          queue.node.setVolume(volumeUp);
          return i.reply({ content: `🔊 | Ses seviyesi ${volumeUp}% olarak ayarlandı.`, ephemeral: true });
        case 'volume_down':
          let volumeDown = queue.node.volume - 10;
          if (volumeDown < 0) volumeDown = 0;
          queue.node.setVolume(volumeDown);
          return i.reply({ content: `🔈 | Ses seviyesi ${volumeDown}% olarak ayarlandı.`, ephemeral: true });
      }
    });
  }
};
