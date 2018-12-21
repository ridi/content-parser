/* eslint-disable no-console */
import { isExists } from './typecheck';
import stringContains from './stringContains';

const LogLevel = Object.freeze({
  SILENT: 'silent',
  ERROR: 'error',
  WARNING: 'warn',
  INFO: 'info',
  VERBOSE: 'verbose',
});

class Logger {
  get logLevel() { return this._logLevel; }

  set logLevel(level) { this._logLevel = stringContains(Object.values(LogLevel), level) ? level : this.logLevel; }

  constructor(namespace, logLevel = '') {
    this.namespace = namespace || 'Logger';
    this._logLevel = stringContains(Object.values(LogLevel), logLevel) ? logLevel : LogLevel.ERROR;
    this._firstTime = null;
  }

  info(message, ...optionalParams) {
    if (stringContains([LogLevel.INFO, LogLevel.VERBOSE], this.logLevel)) {
      console.log(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  async measure(func, thisArg, argsArray, message, ...optionalParams) {
    if (stringContains([LogLevel.INFO, LogLevel.VERBOSE], this.logLevel)) {
      const startTime = new Date().getTime();
      if (!isExists(this._firstTime)) {
        this._firstTime = startTime;
      }
      const result = await func.apply(thisArg, argsArray);
      console.log(`[${this.namespace}] ${message} (${new Date().getTime() - startTime}ms)`, ...optionalParams);
      return result;
    }
    const result = await func.apply(thisArg, argsArray);
    return result;
  }

  measureSync(func, thisArg, argsArray, message, ...optionalParams) {
    if (stringContains([LogLevel.INFO, LogLevel.VERBOSE], this.logLevel)) {
      const startTime = new Date().getTime();
      if (!isExists(this._firstTime)) {
        this._firstTime = startTime;
      }
      const result = func.apply(thisArg, argsArray);
      console.log(`[${this.namespace}] ${message} (${new Date().getTime() - startTime}ms)`, ...optionalParams);
      return result;
    }
    return func.apply(thisArg, argsArray);
  }

  result(message, ...optionalParams) {
    const time = this._firstTime || new Date().getTime();
    if (stringContains([LogLevel.INFO, LogLevel.VERBOSE], this.logLevel)) {
      console.log(`[${this.namespace}] ${message} (${new Date().getTime() - time}ms)`, ...optionalParams);
    }
    this._firstTime = null;
  }

  warn(message, ...optionalParams) {
    if (stringContains([LogLevel.WARNING, LogLevel.VERBOSE], this.logLevel)) {
      console.warn(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  error(message, ...optionalParams) {
    if (stringContains([LogLevel.ERROR, LogLevel.VERBOSE], this.logLevel)) {
      console.error(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }
}

export default Logger;

export { LogLevel };
