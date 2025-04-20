const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

const GENIUS_API_TOKEN = 'PKhrwzTeD_4OOGvpqAIR0wu_BbmBEZ-gzrkJnzt8JcZ_4LGOSR32eLWzkI1LuAHl';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Genius üzerinden şarkı sözlerini gösterir')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('Şarkı ismini giriniz')
                .setRequired(true)),
    cooldown: 5,
    async execute(interaction, client) {
        let song;
        
        // Eğer buton etkileşiminden geliyorsa
        if (interaction.isButton()) {
            const queue = client.player.nodes.get(interaction.guildId);
            if (!queue || !queue.currentTrack) {
                return interaction.reply({
                    content: '❌ Şu anda çalan şarkı yok!',
                    ephemeral: true
                });
            }
            song = queue.currentTrack.title;
        } else {
            song = interaction.options.getString('song');
        }

        await interaction.deferReply();

        try {
            const searchRes = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(song)}`, {
                headers: {
                    Authorization: `Bearer ${GENIUS_API_TOKEN}`
                }
            });

            const hits = searchRes.data.response.hits;
            if (hits.length === 0) {
                return interaction.editReply('❌ Şarkı bulunamadı!');
            }

            const songInfo = hits[0].result;
            const lyricsUrl = songInfo.url;

            const html = await axios.get(lyricsUrl);
            const $ = cheerio.load(html.data);
            const lyricsContainer = $('[data-lyrics-container="true"]');

            if (!lyricsContainer.length) {
                return interaction.editReply('❌ Şarkı sözleri alınamadı (muhtemelen Genius sayfa yapısı değişmiş olabilir).');
            }

            let lyrics = '';
            lyricsContainer.each((i, el) => {
                const htmlContent = $(el).html()?.replace(/<br\s*\/?>/gi, '\n') || '';
                const cleanText = cheerio.load(htmlContent).text();
                lyrics += cleanText.trim() + '\n\n';
            });

            if (!lyrics || lyrics.trim().length === 0) {
                lyrics = '❌ Şarkı sözleri çekilemedi veya Genius üzerinde mevcut değil.';
            }

            const chunks = lyrics.match(/[\s\S]{1,1024}/g);
            const embeds = [];

            chunks.forEach((chunk, index) => {
                const embed = new EmbedBuilder()
                    .setColor('#eacc3d')
                    .setTitle(`🎶 ${songInfo.full_title}`)
                    .setURL(lyricsUrl)
                    .setDescription(`**Şarkı:** ${song}\n\n${chunk}`)
                    .setThumbnail(songInfo.song_art_image_thumbnail_url || null)
                    .setFooter({
                        text: `Sayfa ${index + 1}/${chunks.length} • İsteyen: ${interaction.user.username} • Developer by Voltacik`,
                        iconURL: interaction.user.displayAvatarURL()
                    });

                embeds.push(embed);
            });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev_lyrics')
                    .setLabel('◀️ Önceki')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next_lyrics')
                    .setLabel('Sonraki ▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(embeds.length <= 1)
            );

            const message = await interaction.editReply({
                embeds: [embeds[0]],
                components: embeds.length > 1 ? [row] : []
            });

            if (embeds.length > 1) {
                let currentPage = 0;

                const collector = message.createMessageComponentCollector({ time: 60000 });

                collector.on('collect', async i => {
                    if (i.user.id !== interaction.user.id) {
                        return i.reply({ content: '❌ Bu butonları sadece komutu kullanan kişi kullanabilir!', ephemeral: true });
                    }

                    if (i.customId === 'prev_lyrics') currentPage--;
                    if (i.customId === 'next_lyrics') currentPage++;

                    row.components[0].setDisabled(currentPage === 0);
                    row.components[1].setDisabled(currentPage === embeds.length - 1);

                    await i.update({
                        embeds: [embeds[currentPage]],
                        components: [row]
                    });
                });

                collector.on('end', () => {
                    message.edit({ components: [] });
                });
            }
        } catch (err) {
            console.error(err);
            interaction.editReply('❌ Bir hata oluştu. Daha sonra tekrar dene.');
        }
    }
};
