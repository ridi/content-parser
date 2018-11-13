import Errors, { createError, mustOverride } from '../constant/errors';

const Status = Object.freeze({
  PARSE: 'parse',
  READ: 'read',
});

class CryptoProvider {
  constructor() {
    if (this.constructor === CryptoProvider) {
      throw createError(Errors.EINTR, 'You must use subclasses.');
    }
  }

  /**
   * Update status by parser
   */
  set status(newStatus) {
    const oldStatus = this.status;
    this.status = newStatus;
    this.onStatusChanged(oldStatus, newStatus);
  }

  /**
   * Should initialize cryptor by status if meeded
   * Invoked when parser.parse or parser.readItem(s) is called
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
    mustOverride();
  }

  /**
   * Should execute encrypt or decrypt by condition if needed
   * @param {Buffer} data
   * @param {string} filename
   */
  run(data, filename) { // eslint-disable-line
    // ex)
    // if (condition1) {
    //   return this.encrypt(data, filename)
    // } else if (condition2) {
    //   return this.decrypt(data, filename)
    // }
    // return data;
    mustOverride();
  }

  /**
   * Should encrypt data
   * @param {Buffer} data
   * @param {string} filename
   */
  encrypt(data, filename) { // eslint-disable-line
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
   * @param {string} filename
   */
  decrypt(data, filename) { // eslint-disable-line
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
