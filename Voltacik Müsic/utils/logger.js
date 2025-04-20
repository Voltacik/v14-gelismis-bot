const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Logs klasörünü oluştur
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Tarih formatı
const dateFormat = () => {
    return new Date(Date.now()).toLocaleString('tr-TR');
};

// Logger yapılandırması
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: dateFormat }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        // Hata logları
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Tüm loglar
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Developer footer değişiklik logları
        new winston.transports.File({
            filename: path.join(logsDir, 'footer_changes.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Geliştirme ortamında konsola da log yaz
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = logger; 