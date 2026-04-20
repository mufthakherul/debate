import { config } from '../config';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();

    if (config.logFormat === 'json' || config.nodeEnv === 'production') {
      const payload = {
        timestamp,
        level,
        message,
        meta: meta || undefined,
      };
      return JSON.stringify(payload);
    }

    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    return meta ? `${logMessage} ${JSON.stringify(meta)}` : logMessage;
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const logMessage = this.formatMessage(level, message, meta);

    if (meta) {
      console[level](logMessage, meta);
    } else {
      console[level](logMessage);
    }
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any) {
    if (config.nodeEnv === 'development') {
      this.log('debug', message, meta);
    }
  }
}

export const logger = new Logger();
