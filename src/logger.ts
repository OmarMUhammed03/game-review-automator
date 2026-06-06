export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

let globalLogLevel: LogLevel = LogLevel.DEBUG;

export function setLogLevel(level: LogLevel): void {
  globalLogLevel = level;
}

export function getLogLevel(): LogLevel {
  return globalLogLevel;
}

export class Logger {
  private prefix: string;

  constructor(context: string) {
    this.prefix = `[Chess2Lichess:${context}]`;
  }

  debug(message: string, ...args: any[]): void {
    if (globalLogLevel <= LogLevel.DEBUG) {
      console.debug(
        `%c${this.prefix}%c ${message}`,
        "color: #7f8c8d; font-weight: bold;",
        "",
        ...args
      );
    }
  }

  info(message: string, ...args: any[]): void {
    if (globalLogLevel <= LogLevel.INFO) {
      console.log(
        `%c${this.prefix}%c ${message}`,
        "color: #3498db; font-weight: bold;",
        "",
        ...args
      );
    }
  }

  warn(message: string, ...args: any[]): void {
    if (globalLogLevel <= LogLevel.WARN) {
      console.warn(
        `%c${this.prefix}%c ${message}`,
        "color: #f39c12; font-weight: bold;",
        "",
        ...args
      );
    }
  }

  error(message: string, ...args: any[]): void {
    if (globalLogLevel <= LogLevel.ERROR) {
      console.error(
        `%c${this.prefix}%c ${message}`,
        "color: #e74c3c; font-weight: bold;",
        "",
        ...args
      );
    }
  }
}

export const createLogger = (context: string): Logger => new Logger(context);
