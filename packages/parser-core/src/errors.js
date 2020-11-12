import format from 'string-format';

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
const Errors = {
  ENOENT: { code: 'ENOENT', format: 'ENOENT: no such file or directory. (path: {0})' },
  ENOFILE: { code: 'ENOFILE', format: 'ENOFILE: no such file. (path: {0})' },
  EEXIST: { code: 'EEXIST', format: 'EEXIST: file or directory already exists. (path: {0})' },
  EINVAL: { code: 'EINVAL', format: 'EINVAL: invalid {0}. ({1}: {2})' },
  ENOELMT: { code: 'ENOELMT', format: 'ENOELMT: no such element. (element: {0}, path: {1})' },
  ENOATTR: { code: 'ENOATTR', format: 'ENOATTR: no such attribute. (attribute: {0}, element: {1}, path: {2})' },
  EREQPRM: { code: 'EREQPRM', format: 'EREQPRM: required parameter missing. (name: {0})' },
  EINTR: { code: 'EINTR', format: 'EINTR: interrupted function call. (detail: {0})' },
  ECRYT: { code: 'ECRYT', format: 'ECRYT: cryptor internal error. (detail: {0})' },
  EPDFJS: { code: 'EPDFJS', format: 'EPDFJS: pdf.js internal error. (detail: {0})' },
  ENOIMP: { code: 'ENOIMP', format: 'ENOIMP: function not implemented.' },
};

export default Errors;
/**
 * Create error
 * @param {ErrorType} type
 * @param {string[]} args
 * @returns {Error}
 */
export function createError(type, ...args) {
  const error = new Error(format(type.format, ...args));
  error.code = type.code;
  return error;
}
/**
 * Create MustOverride error
 * @returns {Error}
 */
export function mustOverride() {
  throw createError(Errors.EINTR, 'You must override in a subclass.');
}
