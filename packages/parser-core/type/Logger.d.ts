export default Logger;
export type LogLevel = {
    /**
     * "silent"
     */
    SILENT: string;
    /**
     * "error"
     */
    ERROR: string;
    /**
     * "warn"
     */
    WARN: string;
    /**
     * "info"
     */
    INFO: string;
    /**
     * "debug"
     */
    DEBUG: string;
    /**
     * "verbose"
     */
    VERBOSE: string;
};
export type LoggerOptions = {
    namespace: string;
    logLevel: LogLevel;
};
declare class Logger {
    /**
     * @param  {LogLevel} current
     * @param  {LogLevel} target
     * @returns {boolean}
     */
    static confirm(current: LogLevel, target: LogLevel): boolean;
    /**
     * Construct Logger Class;
     * @param  {string} namespace
     * @param  {LogLevel} logLevel
     */
    constructor(namespace: string, logLevel: LogLevel);
    set logLevel(arg: string | LogLevel);
    get logLevel(): string | LogLevel;
    _logLevel: string | LogLevel;
    namespace: string;
    _firstTime: number;
    /**
     * Log information
     * @param  {any?} message
     * @param  {any[]} ...optionalParams
     */
    info(message: any | null, ...optionalParams: any[]): void;
    /**
     * Log warning
     * @param  {any?} message
     * @param  {any[]} ...optionalParams
     */
    warn(message: any | null, ...optionalParams: any[]): void;
    /**
     * Log error
     * @param  {any?} message
     * @param  {any[]} ...optionalParams
     */
    error(message: any | null, ...optionalParams: any[]): void;
    /**
     * Log degug
     * @param  {string?} message
     * @param  {any[]} ...optionalParams
     */
    debug(message: string | null, ...optionalParams: any[]): void;
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
    measure<T>(func: (...any: any[]) => Promise<T>, thisArg: any, argsArray: any, message: any, ...optionalParams: any[]): Promise<T>;
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
    measureSync<T_2>(func: (...any: any[]) => T_2, thisArg: any, argsArray: any, message: any, ...optionalParams: any[]): T_2;
    /**
     * Measure the total time of this.measureSync
     * @param  {any?} message
     * @param  {any[]} optionalParams
     */
    result(message: any | null, ...optionalParams: any[]): void;
}
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
export const LogLevel: Readonly<{
    SILENT: string;
    ERROR: string;
    WARN: string;
    INFO: string;
    DEBUG: string;
    VERBOSE: string;
}>;
