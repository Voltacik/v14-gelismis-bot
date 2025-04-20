const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const winston = require('winston');

// Developer footer sabiti
const DEVELOPER_FOOTER = {
    text: 'Developer by Voltacik',
    iconURL: 'https://cdn.discordapp.com/attachments/1354096947224510564/1363633045831155934/dfa57be44660e977aee71a5cfa6a7109.gif?ex=6806bdbd&is=68056c3d&hm=a27a1a1b390298e68f69505f7a2d985d92a4bef28c79c669e0959b5cf6e6da17&'
};

// Footer kontrolü için regex pattern
const FOOTER_PATTERN = /Developer by Voltacik/;

// Footer'ı kontrol et
function checkDeveloperFooter(fileContent) {
    return FOOTER_PATTERN.test(fileContent);
}

// Footer'ı geri yükle
function restoreDeveloperFooter(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!checkDeveloperFooter(content)) {
            // Footer'ı ekle veya güncelle
            content = content.replace(
                /\.setFooter\({[^}]*}\)/g,
                `.setFooter({ 
    text: 'Developer by Voltacik',
    iconURL: 'https://cdn.discordapp.com/attachments/1354096947224510564/1363633045831155934/dfa57be44660e977aee71a5cfa6a7109.gif?ex=6806bdbd&is=68056c3d&hm=a27a1a1b390298e68f69505f7a2d985d92a4bef28c79c669e0959b5cf6e6da17&'
})`
            );
            fs.writeFileSync(filePath, content);
            
            // Log kaydı
            logger.warn(`[GÜVENLİK] ${filePath} dosyasındaki developer footer geri yüklendi.`);
            
            // Footer değişiklik logu
            const footerLogger = winston.createLogger({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
                transports: [
                    new winston.transports.File({
                        filename: path.join(__dirname, '../logs/footer_changes.log'),
                        maxsize: 5242880,
                        maxFiles: 5
                    })
                ]
            });

            footerLogger.info({
                type: 'footer_restored',
                file: filePath,
                timestamp: new Date().toISOString(),
                details: {
                    action: 'footer_restored',
                    file: filePath,
                    previous_content: content,
                    new_content: content
                }
            });
        }
    } catch (error) {
        logger.error(`[GÜVENLİK] ${filePath} dosyası kontrol edilirken hata:`, error);
    }
}

// Tüm komutları ve eventleri kontrol et
function monitorCommands() {
    const commandsPath = path.join(__dirname, '../commands');
    const eventsPath = path.join(__dirname, '../events');

    // Komutları kontrol et
    fs.readdirSync(commandsPath).forEach(file => {
        if (file.endsWith('.js')) {
            const filePath = path.join(commandsPath, file);
            restoreDeveloperFooter(filePath);
        }
    });

    // Eventleri kontrol et
    fs.readdirSync(eventsPath).forEach(file => {
        if (file.endsWith('.js')) {
            const filePath = path.join(eventsPath, file);
            restoreDeveloperFooter(filePath);
        }
    });
}

// Bot başlatıldığında footer'ları kontrol et
function initializeSecurity() {
    monitorCommands();
    setInterval(monitorCommands, 300000); // Her 5 dakikada bir kontrol et
}

module.exports = {
    DEVELOPER_FOOTER,
    checkDeveloperFooter,
    restoreDeveloperFooter,
    monitorCommands,
    initializeSecurity
}; 