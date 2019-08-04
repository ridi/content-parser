import { CryptoProvider, AesCryptor } from '@ridi/parser-core';

const { Purpose } = CryptoProvider;
const { Mode, Padding } = AesCryptor;

class TestCryptoProvider extends CryptoProvider {
  constructor(key) {
    super();
    this.cryptor = new AesCryptor(Mode.ECB, { key });
  }

  getCryptor(filePath, purpose) {
    return this.cryptor;
  }

  // decrypt -> parse -> unzip with encrypt
  run(data, filePath, purpose) {
    const cryptor = this.getCryptor(filePath, purpose);
    const options = { padding: Padding.AUTO };
    if (purpose === Purpose.READ_IN_DIR) {
      if (filePath.endsWith('.epub')) {
        return cryptor.decrypt(data, options);
      } else {
        return cryptor.decrypt(data, options);
      }
    } else if (purpose === Purpose.WRITE) {
      return cryptor.encrypt(data, options);
    }
    return data;
  }
}

export default TestCryptoProvider;
