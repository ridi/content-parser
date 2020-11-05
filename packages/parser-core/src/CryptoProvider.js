// eslint-disable-next-line no-unused-vars
import AesCryptor from './AesCryptor';
import Errors, { createError, mustOverride } from './errors';

/**
 * @typedef {string} CryptoProviderOption
 *
 * @typedef {Object} CryptoProviderPurpose
 * @property {CryptoProviderOption} READ_IN_ZIP "read_in_zip"
 * @property {CryptoProviderOption} READ_IN_DIR "read_in_dir"
 * @property {CryptoProviderOption} WRITE "write"
*/

/**
 * @enum {CryptoProviderPurpose}
 */
const Purpose = Object.freeze({
  READ_IN_ZIP: 'read_in_zip',
  READ_IN_DIR: 'read_in_dir',
  WRITE: 'write',
});

class CryptoProvider {
  isStreamMode = true;

  /**
   * Size of data to process at once
   *
   * `null` means use nodejs default (default: 65535)
   * @returns {number}
   */
  get bufferSize() { return null; }

  constructor() {
    if (this.constructor === CryptoProvider) {
      throw createError(Errors.EINTR, 'You must use subclasses.');
    }
  }

  /**
   * Create or reuse AesCryptor by condition
   * @abstract
   * @param {string} filePath
   * @param {string} purpose
   * @returns {AesCryptor}
   */
  getCryptor(filePath, purpose) { // eslint-disable-line no-unused-vars
    // ex)
    // if (condition) {
    //   return new AesCryptor(...);
    // } else {
    //   return new AesCryptor(...);
    // }
    mustOverride();
  }

  /**
   * Should execute encrypt or decrypt by condition if needed
   * @abstract
   * @param {Buffer} data
   * @param {string} filePath
   * @param {string} purpose
   */
  run(data, filePath, purpose) { // eslint-disable-line no-unused-vars
    // ex)
    // const cryptor = this.getCryptor(filePath, status);
    // const padding = AesCryptor.Padding.PKCS7
    // if (condition1) {
    //   return cryptor.encrypt(data, padding)
    // } else if (condition2) {
    //   return cryptor.decrypt(data, padding)
    // }
    // return data;
    mustOverride();
  }
}

CryptoProvider.Purpose = Purpose;

export default CryptoProvider;
