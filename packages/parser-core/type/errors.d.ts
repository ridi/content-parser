interface Error {
    code: string;
    format: string;
}
interface IErrors {
    ENOENT: Error;
    ENOFILE: Error;
    EEXIST: Error;
    EINVAL: Error;
    ENOELMT: Error;
    ENOATTR: Error;
    EREQPRM: Error;
    EINTR: Error;
    ECRYT: Error;
    EPDFJS: Error;
    ENOIMP: Error;
}
declare const Errors: IErrors;
export default Errors;
/**
 * Create error
 */
export declare function createError(type: Error, ...args: string[]): globalThis.Error;
/**
 * Create MustOverride error
 */
export declare function mustOverride(): void;
