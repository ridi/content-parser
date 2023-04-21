
import fs from 'fs';
import Paths from '../../../test/paths';
import AesCryptor from '../lib/AesCryptor';
import CryptoProvider from '../lib/CryptoProvider';
import { Hash } from '../lib/cryptoUtil';

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
