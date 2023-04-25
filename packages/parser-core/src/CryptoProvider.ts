// eslint-disable-next-line no-unused-vars
import AesCryptor from "./AesCryptor";
import Errors, { createError, mustOverride } from "./errors";

export type CryptoProviderOption = string;

enum Purpose {
  READ_IN_ZIP = "read_in_zip",
  READ_IN_DIR = "read_in_dir",
  WRITE = "write",
}

class CryptoProvider {
  static Purpose = Purpose;
  isStreamMode = true;

  constructor() {
    if (this.constructor === CryptoProvider) {
      throw createError(Errors.EINTR, "You must use subclasses.");
    }
  }

  /**
   * Size of data to process at once
   * `null` means use nodejs default (default: 65535)
   */
  get bufferSize(): number | null {
    return null;
  }

  /**
   * Create or reuse AesCryptor by condition
   */
  getCryptor(filePath: string, purpose: string): AesCryptor {
    // eslint-disable-line no-unused-vars
    // ex)
    // if (condition) {
    //   return new AesCryptor(...);
    // } else {
    //   return new AesCryptor(...);
    // }
    return mustOverride();
  }

  /**
   * Should execute encrypt or decrypt by condition if needed
   */
  run(data: Buffer, filePath: string, purpose: string) {
    // eslint-disable-line no-unused-vars
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

export default CryptoProvider;
