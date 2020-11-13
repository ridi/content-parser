/* eslint-disable no-unused-vars */
import { mustOverride } from './errors';

/**
 * @typedef {(data: string | CryptoJs.lib.WordArray) => CryptoJs.lib.WordArray} EncodeAndDecode
 * @typedef {Object} Operator
 * @property {string} name
 * @property {EncodeAndDecode} encrypt
 * @property {EncodeAndDecode} decrypt
 */

class BaseCryptor {
  /**
   * Encrypt string
   * @param {string} data
   * @param {CryptOption} options
   * @returns {string} encrypted string
   */
  encrypt(data) {
    mustOverride();
  }

  /**
   * Decrupt string
   * @param {string} data
   * @param {CryptOption} options
   * @returns {string} decrypted string
   */
  decrypt(data) {
    mustOverride();
  }
}
export default BaseCryptor;
