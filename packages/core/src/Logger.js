/* eslint-disable no-console */
import stringContains from './stringContains';

const LogLevel = Object.freeze({
  SILENT: 'silent',
  ERROR: 'error',
  WARNING: 'warn',
  INFO: 'info',
  VERBOSE: 'verbose',
});

let logLevel = LogLevel.ERROR;

class Logger {
  static setLogLevel(level) {
    logLevel = stringContains(Object.values(LogLevel), level) ? level : logLevel;
  }

  static getLogLevel() {
    return logLevel;
  }

  static info(message, ...optionalParams) {
    if (stringContains([LogLevel.INFO, LogLevel.VERBOSE], logLevel)) {
      console.log(message, ...optionalParams);
    }
  }

  static async measure(func, message, ...optionalParams) {
    if (stringContains([LogLevel.INFO, LogLevel.VERBOSE], logLevel)) {
      const startTime = new Date().getTime();
      const result = await func();
      console.log(`${message} (${new Date().getTime() - startTime}ms)`, ...optionalParams);
      return result;
    }
    return func();
  }

  static measureSync(func, message, ...optionalParams) {
    if (stringContains([LogLevel.INFO, LogLevel.VERBOSE], logLevel)) {
      const startTime = new Date().getTime();
      const result = func();
      console.log(`${message} (${new Date().getTime() - startTime}ms)`, ...optionalParams);
      return result;
    }
    return func();
  }

  static warn(message, ...optionalParams) {
    if (stringContains([LogLevel.WARNING, LogLevel.VERBOSE], logLevel)) {
      console.warn(message, ...optionalParams);
    }
  }

  static error(message, ...optionalParams) {
    if (stringContains([LogLevel.ERROR, LogLevel.VERBOSE], logLevel)) {
      console.error(message, ...optionalParams);
    }
  }
}

Logger.LogLevel = LogLevel;

export default Logger;
