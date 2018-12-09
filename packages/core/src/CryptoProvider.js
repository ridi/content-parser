import Errors, { createError, mustOverride } from './errors';

const Status = Object.freeze({
  PARSE: 'parse',
  UNZIP: 'unzip',
  READ: 'read',
});

class CryptoProvider {
  constructor() {
    if (this.constructor === CryptoProvider) {
      throw createError(Errors.EINTR, 'You must use subclasses.');
    }
    // ex)
    // const key = ...;
    // this.cryptor = new Cryptor(Modes.ECB, { key });
  }

  /**
   * Update status by parser
   */
  set status(newStatus) {
    const oldStatus = this.status;
    this._status = newStatus;
    this.onStatusChanged(oldStatus, newStatus);
  }

  /**
   * Get status
   */
  get status() { return this._status; }

  /**
   * Invoked when parser.parse or parser.readItem(s) or parser._unzip is called
   * @param {string} oldStatus
   * @param {string} newStatus
   */
  onStatusChanged(oldStatus, newStatus) { // eslint-disable-line
    // ex)
    // if (oldStatus !== newStatus) {
    //   const key = ...;
    //   const iv = ...;
    //   this.cryptor = new Cryptor(Modes.CFB, { key, iv });
    // }
  }

  /**
   * Should execute encrypt or decrypt by condition if needed
   * @param {Buffer} data
   * @param {string} filePath
   */
  run(data, filePath) { // eslint-disable-line
    // ex)
    // if (condition1) {
    //   return this.encrypt(data, filePath)
    // } else if (condition2) {
    //   return this.decrypt(data, filePath)
    // }
    // return data;
    mustOverride();
  }

  /**
   * Should encrypt data
   * @param {Buffer} data
   * @param {string} filePath
   */
  encrypt(data, filePath) { // eslint-disable-line
    // ex)
    // if (condition) {
    //   return cryptor1.encrypt(data);
    // } else {
    //   return cryptor2.encrypt(data);
    // }
    mustOverride();
  }

  /**
   * Should decrypt data
   * @param {Buffer} data
   * @param {string} filePath
   */
  decrypt(data, filePath) { // eslint-disable-line
    // ex)
    // if (condition) {
    //   return cryptor1.decrypt(data);
    // } else {
    //   return cryptor2.decrypt(data);
    // }
    mustOverride();
  }
}

CryptoProvider.Status = Status;

export default CryptoProvider;
