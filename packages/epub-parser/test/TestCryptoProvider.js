import { CryptoProvider, AesCryptor, Hash } from '@ridi/parser-core';
import fs from 'fs';
import Paths from '../../../test/paths';

const { Purpose } = CryptoProvider;
const { Mode, Padding } = AesCryptor;

class TestCryptoProvider extends CryptoProvider {
  isStreamMode = true;

  constructor(key) {
    super();
    this.cryptor = new AesCryptor(Mode.ECB, { key });
    this.prepareTest();
  }

  shouldDecryptInChunk = true;

  prepareTest() {
    const options = { padding: Padding.AUTO };
    const data = fs.readFileSync(Paths.DEFAULT);
    const encryptedData = this.cryptor.encrypt(data, options);
    const originData = fs.readFileSync(Paths.ENCRYPTED_DEFAULT);
    if (Hash.sha512(encryptedData) !== Hash.sha512(originData)) {
      fs.writeFileSync(Paths.ENCRYPTED_DEFAULT, encryptedData);
    }
  }

  getCryptor(filePath, purpose) {
    return this.cryptor;
  }

  // decrypt -> parse -> unzip with encrypt
  run(data, filePath, purpose) {
    const cryptor = this.getCryptor(filePath, purpose);
    const options = { padding: Padding.AUTO };
    if (purpose === Purpose.READ_IN_DIR) {
      return cryptor.decrypt(data, options);
    } else if (purpose === Purpose.WRITE) {
      return cryptor.encrypt(data, options);
    }
    return data;
  }
}

export default TestCryptoProvider;
