
import fs from 'fs';
import Paths from '../../../test/paths';
import AesCryptor from '../src/AesCryptor';
import CryptoProvider from '../src/CryptoProvider';
import { Hash } from '../src/cryptoUtil';

const { Purpose } = CryptoProvider;
const { Mode, Padding } = AesCryptor;

class TestAsyncCryptoProvider extends CryptoProvider {
  isStreamMode = false;

  bufferSize = 1024;

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
