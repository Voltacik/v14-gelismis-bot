const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const CommandHandler = require('./utils/commandHandler');
const logger = require('./utils/logger');
const { initializeSecurity } = require('./utils/developerCheck');

// Dosya silme koruması
const protectedFiles = ['LICENSE', 'voltacik.js', 'package.json', 'developerCheck.js'];
protectedFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.chmodSync(file, 0o444); // Salt okunur yap
    }
});

// Developer footer kontrolü
initializeSecurity();

class Voltacik {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ],
            failIfNotExists: false
        });

        this.player = new Player(this.client, {
            ytdlOptions: {
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            },
            smoothVolume: true,
            leaveOnEnd: false,
            leaveOnStop: false,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 300000,
            autoSelfDeaf: true,
            initialVolume: 100
        });

        this.client.player = this.player;
        this.client.commands = new Collection();
        this.commandHandler = new CommandHandler(this.client, this.player);
    }

    async start() {
        try {
            const token = process.env.TOKEN;
            if (!token) {
                throw new Error("❌ TOKEN bulunamadı. Lütfen .env dosyanızı kontrol edin.");
            }

            this.client.once('ready', async () => {
                logger.info(`${this.client.user.tag} olarak giriş yapıldı!`);

                this.client.user.setPresence({
                    activities: [{ name: '🎵 Müzik Çalıyor', type: 0 }],
                    status: 'dnd'
                });

                try {
                    await this.player.extractors.loadMulti(DefaultExtractors);
                    await this.commandHandler.loadCommands();
                    await this.commandHandler.registerCommands();
                    logger.info("[✓] Tüm komutlar başarıyla Discord'a yüklendi.");
                } catch (err) {
                    logger.error("Başlatma sırasında hata:", err);
                }
            });

            this.client.on('interactionCreate', async interaction => {
                if (!interaction.isChatInputCommand()) return;

                try {
                    await this.commandHandler.handleCommand(interaction);
                } catch (err) {
                    logger.error("Komut çalıştırılırken hata:", err);
                    
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: "❌ Komut çalıştırılırken bir hata oluştu.",
                            ephemeral: true
                        });
                    }
                }
            });

            this.loadEvents();
            await this.client.login(token);
        } catch (error) {
            logger.error("Bot başlatılırken kritik hata:", error);
            process.exit(1);
        }
    }

    loadEvents() {
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            try {
                const filePath = path.join(eventsPath, file);
                const event = require(filePath);

                if (!event || !event.name || typeof event.execute !== 'function') {
                    logger.warn(`[UYARI] ${file} event dosyası uygun bir biçimde dışa aktarılmamış.`);
                    continue;
                }

                if (['voiceStateUpdate', 'messageCreate', 'guildMemberAdd'].includes(event.name)) {
                    this.client.on(event.name, (...args) => event.execute(...args, this.client));
                } else {
                    this.player.events.on(event.name, (...args) => event.execute(...args, this.player));
                }
            } catch (error) {
                logger.error(`${file} event dosyası yüklenirken hata:`, error);
            }
        }
    }
}

const bot = new Voltacik();
bot.start();
