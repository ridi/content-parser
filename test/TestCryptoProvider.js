import CryptoProvider from '../src/cryptor/CryptoProvider';
import Cryptor, {
  Modes,
  Padding,
} from '../src/cryptor/Cryptor';

class TestCryptoProvider extends CryptoProvider {
  constructor(key) {
    super();
    this.cryptor = new Cryptor(Modes.ECB, { key, padding: Padding.PKCS7 });
  }

  // decrypt -> parse -> unzip with encrypt
  run(data, filename) {
    if (this.status === CryptoProvider.Status.PARSE) {
      if (filename.endsWith('.epub')) {
        return this.decrypt(data, filename);
      }
    } else if (this.status === CryptoProvider.Status.UNZIP) {
      return this.encrypt(data, filename);
    }
    return data;
  }

  encrypt(data, filename) {
    return this.cryptor.encrypt(data);
  }

  decrypt(data, filename) {
    return this.cryptor.decrypt(data);
  }
}

export default TestCryptoProvider;
