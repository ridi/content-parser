/**
 * Create error
 * @param  {Errors} type
 * @param  {string[]} args
 * @returns {Error}
 */
export function createError(type: Errors, ...args: string[]): Error;
/**
 * Create MustOverride error
 * @returns {Error}
 */
export function mustOverride(): Error;
export default Errors;
export type ErrorType = {
    code: string;
    format: string;
};
export type Errors = {
    ENOENT: ErrorType;
    ENOFILE: ErrorType;
    EEXIST: ErrorType;
    EINVAL: ErrorType;
    ENOELMT: ErrorType;
    ENOATTR: ErrorType;
    EREQPRM: ErrorType;
    EINTR: ErrorType;
    ECRYT: ErrorType;
    EPDFJS: ErrorType;
    ENOIMP: ErrorType;
};
/**
 * @typedef ErrorType
 * @property {string} code
 * @property {string} format
*/
/**
 * @typedef Errors
 * @property {ErrorType} ENOENT
 * @property {ErrorType} ENOFILE
 * @property {ErrorType} EEXIST
 * @property {ErrorType} EINVAL
 * @property {ErrorType} ENOELMT
 * @property {ErrorType} ENOATTR
 * @property {ErrorType} EREQPRM
 * @property {ErrorType} EINTR
 * @property {ErrorType} ECRYT
 * @property {ErrorType} EPDFJS
 * @property {ErrorType} ENOIMP
 */
/**
 * @type {Errors}
 */
declare const Errors: Errors;
