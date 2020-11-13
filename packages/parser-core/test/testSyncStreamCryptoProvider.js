
import fs from 'fs';
import Paths from '../../../test/paths';
import AesCryptor from '../src/AesCryptor';
import CryptoProvider from '../src/CryptoProvider';
import { Hash } from '../src/cryptoUtil';

const { Purpose } = CryptoProvider;
const { Mode, Padding } = AesCryptor;

class TestCryptoStreamProvider extends CryptoProvider {
  isStreamMode = true;

  constructor(key) {
    super();
  }

  getCryptor(filePath, purpose) {
    return this.cryptor;
  }

  run(data, filePath, purpose) {
    return data;
  }
}

export default TestCryptoStreamProvider;
