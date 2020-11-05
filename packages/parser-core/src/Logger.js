/* eslint-disable no-console */
import { isExists } from './typecheck';
import { stringContains } from './stringUtil';

/**
  * @typedef LogLevel
  * @property {string} SILENT "silent"
  * @property {string} ERROR "error"
  * @property {string} WARN "warn"
  * @property {string} INFO "info"
  * @property {string} DEBUG "debug"
  * @property {string} VERBOSE "verbose"
  *
  * @typedef LoggerOptions
  * @property {string} namespace
  * @property {LogLevel} logLevel
*/

/**
* @enum {LogLevel}
*/
const LogLevel = Object.freeze({
  SILENT: 'silent',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  VERBOSE: 'verbose',
});

/**
 * Get an order of a log level
 * @param  {LogLevel} logLevel
 * @returns {number} order of a level
 */
const getOrder = (logLevel) => {
  switch (logLevel) {
    case LogLevel.ERROR: return 1;
    case LogLevel.WARN: return 2;
    case LogLevel.INFO: return 3;
    case LogLevel.DEBUG: return 4;
    case LogLevel.VERBOSE: return 5;
    default: return 0;
  }
};

const touchTime = time => new Date().getTime() - time;

class Logger {
  /**
   * @private
   */
  _logLevel;

  /**
   * @private
  */
  namespace;

  /**
   * @private
  */
  _firstTime;

  get logLevel() { return this._logLevel; }

  set logLevel(level) { this._logLevel = stringContains(Object.values(LogLevel), level) ? level : this.logLevel; }

  /**
   * Construct Logger Class;
   * @param  {string} namespace
   * @param  {LogLevel} logLevel
   */
  constructor(namespace, logLevel) {
    this.namespace = namespace || Logger.name;
    this._logLevel = stringContains(Object.values(LogLevel), logLevel) ? logLevel : LogLevel.WARN;
    this._firstTime = null;
  }

  /**
   * @param  {LogLevel} current
   * @param  {LogLevel} target
   * @returns {boolean}
   */
  static confirm(current, target) {
    return getOrder(current) >= getOrder(target);
  }

  /**
   * Log information
   * @param  {any?} message
   * @param  {any[]} ...optionalParams
   */
  info(message, ...optionalParams) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      console.info(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Log warning
   * @param  {any?} message
   * @param  {any[]} ...optionalParams
   */
  warn(message, ...optionalParams) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.WARN)) {
      console.warn(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Log error
   * @param  {any?} message
   * @param  {any[]} ...optionalParams
   */
  error(message, ...optionalParams) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.ERROR)) {
      console.error(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Log degug
   * @param  {string?} message
   * @param  {any[]} ...optionalParams
   */
  debug(message, ...optionalParams) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.DEBUG)) {
      console.debug(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  /**
   * @async
   * Measure run time onf a function.
   * @param  {(...any)=>Promise<T>} func
   * @param  {any} thisArg
   * @param  {any} argsArray
   * @param  {any} message
   * @param  {any[]} optionalParams
   * @returns {Promise<T>} result of the run
   * @template T
   */
  async measure(func, thisArg, argsArray, message, ...optionalParams) {
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

  /**
   * Measure run time of a function
   * @param  {(...any)=>T} func
   * @param  {any} thisArg
   * @param  {any} argsArray
   * @param  {any} message
   * @param  {any[]} optionalParams
   * @returns {T} result of the function
   * @template T
   */
  measureSync(func, thisArg, argsArray, message, ...optionalParams) {
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

  /**
   * Measure the total time of this.measureSync
   * @param  {any?} message
   * @param  {any[]} optionalParams
   */
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
