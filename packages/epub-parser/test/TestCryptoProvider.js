import { CryptoProvider, Cryptor } from '@ridi/parser-core';

const { Purpose } = CryptoProvider;
const { Modes, Padding } = Cryptor;

class TestCryptoProvider extends CryptoProvider {
  constructor(key) {
    super();
    this.cryptor = new Cryptor(Modes.ECB, { key });
  }

  getCryptor(filePath, purpose) {
    return this.cryptor;
  }

  // decrypt -> parse -> unzip with encrypt
  run(data, filePath, purpose) {
    const cryptor = this.getCryptor(filePath, purpose);
    const padding = Padding.AUTO;
    if (purpose === Purpose.READ_IN_DIR) {
      if (filePath.endsWith('.epub')) {
        return cryptor.decrypt(data, padding);
      } else {
        return cryptor.decrypt(data, padding);
      }
    } else if (purpose === Purpose.WRITE) {
      return cryptor.encrypt(data, padding);
    }
    return data;
  }
}

export default TestCryptoProvider;
