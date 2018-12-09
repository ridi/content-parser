import { CryptoProvider, Cryptor } from '@ridi/parser-core';

const { Status } = CryptoProvider;
const { Modes, Padding } = Cryptor;

class TestCryptoProvider extends CryptoProvider {
  constructor(key) {
    super();
    this.cryptor = new Cryptor(Modes.ECB, { key, padding: Padding.PKCS7 });
  }

  // decrypt -> parse -> unzip with encrypt
  run(data, filePath) {
    if (this.status === Status.PARSE) {
      if (filePath.endsWith('.epub')) {
        return this.decrypt(data);
      }
    } else if (this.status === Status.UNZIP) {
      return this.encrypt(data);
    } else if (this.status === Status.READ) {
      return Buffer.from(this.decrypt(data));
    }
    return data;
  }

  encrypt(data) {
    return this.cryptor.encrypt(data);
  }

  decrypt(data) {
    return this.cryptor.decrypt(data);
  }
}

export default TestCryptoProvider;
