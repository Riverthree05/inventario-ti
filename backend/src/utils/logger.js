const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, printf, json } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  try {
    // If message is already an object, stringify minimal
    if (typeof message === 'object') return `${timestamp} ${level}: ${JSON.stringify(message)}`;
    return `${timestamp} ${level}: ${message}`;
  } catch (e) {
    return `${timestamp} ${level}: ${message}`;
  }
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), json()),
  transports: [
    new transports.Console({ format: combine(timestamp(), logFormat) }),
    new DailyRotateFile({ filename: 'logs/app-%DATE%.log', datePattern: 'YYYY-MM-DD', maxSize: '20m', maxFiles: '14d', zippedArchive: true })
  ],
  exitOnError: false
});

module.exports = logger;
