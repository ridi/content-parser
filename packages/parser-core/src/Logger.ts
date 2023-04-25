/* eslint-disable no-console */
import { stringContains } from "./stringUtil";
import { isExists } from "./typecheck";

enum LogLevel {
  SILENT = "silent",
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  VERBOSE = "verbose",
}

export type LoggerOptions = {
  namespace: string;
  logLevel: LogLevel;
};

/**
 * Get an order of a log level
 * @returns {number} order of a level
 */
const getOrder = (logLevel: LogLevel) => {
  switch (logLevel) {
    case LogLevel.ERROR:
      return 1;
    case LogLevel.WARN:
      return 2;
    case LogLevel.INFO:
      return 3;
    case LogLevel.DEBUG:
      return 4;
    case LogLevel.VERBOSE:
      return 5;
    default:
      return 0;
  }
};

const touchTime = (time: number) => performance.now() - time;

class Logger {
  private _logLevel: LogLevel;

  private namespace;

  private _firstTime;

  get logLevel() {
    return this._logLevel;
  }

  set logLevel(level: LogLevel) {
    this._logLevel = stringContains(Object.values(LogLevel), level)
      ? level
      : this.logLevel;
  }

  /**
   * Construct Logger Class;
   */
  constructor(namespace: string, logLevel: LogLevel) {
    this.namespace = namespace || Logger.name;
    this._logLevel = stringContains(Object.values(LogLevel), logLevel)
      ? logLevel
      : LogLevel.WARN;
    this._firstTime = null;
  }

  static confirm(current: LogLevel, target: LogLevel) {
    return getOrder(current) >= getOrder(target);
  }

  /**
   * Log information
   */
  info(message: any, ...optionalParams: any[]) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      console.info(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Log warning
   */
  warn(message: any, ...optionalParams: any[]) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.WARN)) {
      console.warn(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Log error
   */
  error(message: any, ...optionalParams: any[]) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.ERROR)) {
      console.error(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Log degug
   */
  debug(message: any, ...optionalParams: any[]) {
    /* istanbul ignore else */
    if (Logger.confirm(this.logLevel, LogLevel.DEBUG)) {
      console.debug(`[${this.namespace}] ${message}`, ...optionalParams);
    }
  }

  /**
   * Measure run time onf a function.
   */
  async measure<T>(
    func: (...any: any[]) => Promise<T>,
    thisArg: any,
    argsArray: any,
    message: any,
    ...optionalParams: any[]
  ): Promise<T> {
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      const startTime = performance.now();
      if (!isExists(this._firstTime)) {
        this._firstTime = startTime;
      }
      const result = await func.apply(thisArg, argsArray);
      console.log(
        `[${this.namespace}] ${message}`,
        ...optionalParams,
        `(${touchTime(startTime)}ms)`
      );
      return result;
    }
    const result = await func.apply(thisArg, argsArray);
    return result;
  }

  /**
   * Measure run time of a function
   */
  measureSync<T>(
    func: (...any) => T,
    thisArg: any,
    argsArray: any,
    message: any,
    ...optionalParams: any[]
  ): T {
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      const startTime = performance.now();
      if (!isExists(this._firstTime)) {
        this._firstTime = startTime;
      }
      const result = func.apply(thisArg, argsArray);
      console.log(
        `[${this.namespace}] ${message}`,
        ...optionalParams,
        `(${touchTime(startTime)}ms)`
      );
      return result;
    }
    return func.apply(thisArg, argsArray);
  }

  /**
   * Measure the total time of this.measureSync
   * @param {any?} message
   * @param {any[]} optionalParams
   */
  result(message: any, ...optionalParams: any[]) {
    const startTime = this._firstTime || performance.now();
    if (Logger.confirm(this.logLevel, LogLevel.INFO)) {
      console.log(
        `[${this.namespace}] ${message}`,
        ...optionalParams,
        `(${touchTime(startTime)}ms)`
      );
    }
    this._firstTime = null;
  }
}

export default Logger;

export { LogLevel };
