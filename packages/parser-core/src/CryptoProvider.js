import Errors, { createError, mustOverride } from './errors';

const Purpose = Object.freeze({
  READ_IN_ZIP: 'read_in_zip',
  READ_IN_DIR: 'read_in_dir',
  WRITE: 'write',
});

class CryptoProvider {
  constructor() {
    if (this.constructor === CryptoProvider) {
      throw createError(Errors.EINTR, 'You must use subclasses.');
    }
  }

  /**
   * Create or reuse Cryptor by condition
   * @param {string} filePath
   * @param {string} purpose
   * @returns {Cryptor}
   */
  getCryptor(filePath, purpose) { // eslint-disable-line
    // ex)
    // if (condition) {
    //   return new Cryptor(...);
    // } else {
    //   return new Cryptor(...);
    // }
    mustOverride();
  }

  /**
   * Should execute encrypt or decrypt by condition if needed
   * @param {Buffer} data
   * @param {string} filePath
   * @param {string} purpose
   */
  run(data, filePath, purpose) { // eslint-disable-line
    // ex)
    // const cryptor = this.getCryptor(filePath, status);
    // const padding = Cryptor.Padding.PKCS7
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
