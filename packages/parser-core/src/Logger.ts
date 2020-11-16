/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { isExists } from './typecheck';


enum LogLevel {
  SILENT = 'silent',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

const getOrder = (logLevel: LogLevel) => {
  switch (logLevel) {
    case LogLevel.ERROR: return 1;
    case LogLevel.WARN: return 2;
    case LogLevel.INFO: return 3;
    case LogLevel.DEBUG: return 4;
    case LogLevel.VERBOSE: return 5;
    default: return 0;
  }
};

export interface LoggerOption {
  namespace: string;
  logLevel?: LogLevel;
}

const touchTime = (time: number) => new Date().getTime() - time;

class Logger {

  private _logLevel: LogLevel;

  private namespace: string;

  private _firstTime: number | null;

  get logLevel(): LogLevel { return this._logLevel; }

  set logLevel(level: LogLevel) { this._logLevel = level }

  constructor(namespace: string, logLevel?: LogLevel) {
    this.namespace = namespace || Logger.name;
    this._logLevel = logLevel || LogLevel.WARN;
    this._firstTime = null;
  }

  static confirm(current: LogLevel, target: LogLevel): boolean {
    return getOrder(current) >= getOrder(target);
  }

  info(message: string, ...optionalParams: string[]): void {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      console.info(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  warn(message: string, ...optionalParams: string[]): void {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.WARN)) {
      console.warn(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  error(message: string, ...optionalParams: string[]): void {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.ERROR)) {
      console.error(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  debug(message: string, ...optionalParams: string[]): void {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.DEBUG)) {
      console.debug(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  async measure<T>(func: (...any: any[])=>Promise<T>, thisArg: any, argsArray: any[], message: string, ...optionalParams:string[]):Promise<T> {
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      const startTime = new Date().getTime();
      if (!isExists(this._firstTime)) {
        this._firstTime = startTime;
      }
      const result = await func.apply(thisArg, argsArray);
      console.log(`[${this.namespace}] ${message}`, ...optionalParams, `(${touchTime(startTime)}ms)`);
      return result;
    }
    const result = await func.apply(thisArg, argsArray);
    return result;
  }

  measureSync<T>(func: (...any: any[])=>T, thisArg: any, argsArray: any[], message: string, ...optionalParams:string[]):T {
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      const startTime = new Date().getTime();
      if (!isExists(this._firstTime)) {
        this._firstTime = startTime;
      }
      const result = func.apply(thisArg, argsArray);
      console.log(`[${this.namespace}] ${message}`, ...optionalParams, `(${touchTime(startTime)}ms)`);
      return result;
    }
    return func.apply(thisArg, argsArray);
  }

  result(message: string, ...optionalParams: string[]) {
    const startTime = this._firstTime || new Date().getTime();
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      console.log(`[${this.namespace}] ${message}`, ...optionalParams, `(${touchTime(startTime)}ms)`);
    }
    this._firstTime = null;
  }
}

export default Logger;

export { LogLevel };
