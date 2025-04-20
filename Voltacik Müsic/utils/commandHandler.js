const { REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const logger = require('./logger');
const { EmbedBuilder } = require('discord.js');

class CommandHandler {
  constructor(client, player) {
    this.client = client;
    this.player = player;
    this.commands = new Collection();
    this.cooldowns = new Collection();
  }

  async loadCommands() {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
          this.commands.set(command.data.name, command);
          logger.info(`[✓] ${file} komutu yüklendi.`);
        } else {
          logger.warn(`[UYARI] ${file} komutu uygun bir biçimde dışa aktarılmamış.`);
        }
      } catch (error) {
        logger.error(`${file} komutu yüklenirken hata:`, error);
      }
    }
  }

  async registerCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    const commandsData = [...this.commands.values()].map(cmd => cmd.data.toJSON());

    try {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commandsData }
      );
      logger.info('[✓] Tüm komutlar başarıyla Discord\'a yüklendi.');
    } catch (error) {
      logger.error('Komutlar Discord\'a yüklenirken hata:', error);
      throw error;
    }
  }

  async handleCommand(interaction) {
    const command = this.commands.get(interaction.commandName);
    if (!command) return;

    // Cooldown kontrolü
    if (command.cooldown) {
      if (!this.cooldowns.has(command.data.name)) {
        this.cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = this.cooldowns.get(command.data.name);
      const cooldownAmount = command.cooldown * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({
            content: `❌ Bu komutu tekrar kullanabilmek için ${timeLeft.toFixed(1)} saniye beklemelisiniz.`,
            ephemeral: true
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }

    try {
      logger.info(`${interaction.user.tag} komutu kullandı: /${interaction.commandName}`);
      await command.execute(interaction, this.client, this.player);
    } catch (error) {
      logger.error(`Komut çalıştırılırken hata (${interaction.commandName}):`, error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Komut Hatası')
        .setDescription('Komut çalıştırılırken bir hata oluştu!')
        .addFields(
          { name: 'Komut', value: interaction.commandName, inline: true },
          { name: 'Hata', value: error.message, inline: true }
        )
        .setFooter({ 
          text: 'Developer by Voltacik',
          iconURL: this.client.user.displayAvatarURL()
        });

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  }
}

module.exports = CommandHandler;
