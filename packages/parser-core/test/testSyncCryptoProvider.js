
import fs from 'fs';
import Paths from '../../../test/paths';
import AesCryptor from '../src/AesCryptor';
import CryptoProvider from '../src/CryptoProvider';
import { Hash } from '../src/cryptoUtil';

const { Purpose } = CryptoProvider;
const { Mode, Padding } = AesCryptor;

class TestSyncCryptoProvider extends CryptoProvider {
  isStreamMode = false;

  get bufferSize() { return null; }

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

export default TestSyncCryptoProvider;
