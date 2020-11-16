declare enum LogLevel {
    SILENT = "silent",
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    VERBOSE = "verbose"
}
export interface LoggerOption {
    namespace: string;
    logLevel?: LogLevel;
}
declare class Logger {
    private _logLevel;
    private namespace;
    private _firstTime;
    get logLevel(): LogLevel;
    set logLevel(level: LogLevel);
    constructor(namespace: string, logLevel?: LogLevel);
    static confirm(current: LogLevel, target: LogLevel): boolean;
    info(message: string, ...optionalParams: string[]): void;
    warn(message: string, ...optionalParams: string[]): void;
    error(message: string, ...optionalParams: string[]): void;
    debug(message: string, ...optionalParams: string[]): void;
    measure<T>(func: (...any: any[]) => Promise<T>, thisArg: any, argsArray: any[], message: string, ...optionalParams: string[]): Promise<T>;
    measureSync<T>(func: (...any: any[]) => T, thisArg: any, argsArray: any[], message: string, ...optionalParams: string[]): T;
    result(message: string, ...optionalParams: string[]): void;
}
export default Logger;
export { LogLevel };
