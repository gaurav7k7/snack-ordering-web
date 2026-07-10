import winston from 'winston';

import { env } from '../config/env.js';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} ${level}: ${stack ?? message}${extra}`;
  }),
);

const winstonLogger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false,
});

// Console output is human-readable in every environment; the file
// transports above keep the structured JSON for later searching/shipping.
winstonLogger.add(new winston.transports.Console({ format: consoleFormat }));

type LogMeta = unknown[];

function flattenMeta(meta: LogMeta) {
  if (meta.length === 0) return undefined;
  if (meta.length === 1 && meta[0] instanceof Error) {
    const err = meta[0];
    return { stack: err.stack, errorName: err.name };
  }
  return { meta };
}

export const logger = {
  info(message: string, ...meta: LogMeta) {
    winstonLogger.info(message, flattenMeta(meta));
  },
  warn(message: string, ...meta: LogMeta) {
    winstonLogger.warn(message, flattenMeta(meta));
  },
  error(message: string, ...meta: LogMeta) {
    winstonLogger.error(message, flattenMeta(meta));
  },
};
