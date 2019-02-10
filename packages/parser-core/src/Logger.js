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

const getOrder = (logLevel) => {
  switch (logLevel) {
    case LogLevel.ERROR: return 1;
    case LogLevel.WARNING: return 2;
    case LogLevel.INFO: return 3;
    case LogLevel.VERBOSE: return 4;
    default: return 0;
  }
};

const touchTime = time => new Date().getTime() - time;

class Logger {
  get logLevel() { return this._logLevel; }

  set logLevel(level) { this._logLevel = stringContains(Object.values(LogLevel), level) ? level : this.logLevel; }

  constructor(namespace, logLevel = '') {
    this.namespace = namespace || Logger.name;
    this._logLevel = stringContains(Object.values(LogLevel), logLevel) ? logLevel : LogLevel.ERROR;
    this._firstTime = null;
  }

  static confirm(current, target) {
    return getOrder(current) >= getOrder(target);
  }

  info(message, ...optionalParams) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      console.info(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  warn(message, ...optionalParams) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.WARNING)) {
      console.warn(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  error(message, ...optionalParams) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.ERROR)) {
      console.error(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  async measure(run, thisArg, argsArray, message, ...optionalParams) {
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      const startTime = new Date().getTime();
      if (!isExists(this._firstTime)) {
        this._firstTime = startTime;
      }
      const result = await run.apply(thisArg, argsArray);
      console.log(`[${this.namespace}] ${message}`, ...optionalParams, `(${touchTime(startTime)}ms)`);
      return result;
    }
    const result = await run.apply(thisArg, argsArray);
    return result;
  }

  measureSync(run, thisArg, argsArray, message, ...optionalParams) {
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      const startTime = new Date().getTime();
      if (!isExists(this._firstTime)) {
        this._firstTime = startTime;
      }
      const result = run.apply(thisArg, argsArray);
      console.log(`[${this.namespace}] ${message}`, ...optionalParams, `(${touchTime(startTime)}ms)`);
      return result;
    }
    return run.apply(thisArg, argsArray);
  }

  result(message, ...optionalParams) {
    const startTime = this._firstTime || new Date().getTime();
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      console.log(`[${this.namespace}] ${message}`, ...optionalParams, `(${touchTime(startTime)}ms)`);
    }
    this._firstTime = null;
  }
}

export default Logger;

export { LogLevel };
