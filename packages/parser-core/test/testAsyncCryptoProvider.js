
import fs from 'fs';
import Paths from '../../../test/paths';
import AesCryptor from '../lib/AesCryptor';
import CryptoProvider from '../lib/CryptoProvider';
import { Hash } from '../lib/cryptoUtil';

const { Purpose } = CryptoProvider;
const { Mode, Padding } = AesCryptor;

class TestAsyncCryptoProvider extends CryptoProvider {
  isStreamMode = false;

  get bufferSize() { return 1024 };

  constructor(key) {
    super();
  }

  getCryptor(filePath, purpose) {
    return this.cryptor;
  }

  async run(data, filePath, purpose) {
    return data;
  }
}

export default TestAsyncCryptoProvider;
