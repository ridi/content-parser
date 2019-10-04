import { assert } from 'chai';

import {
  EpubParser,
  EpubBook,
  Errors,
  LogLevel,
  CryptoProvider,
  AesCryptor,
  Hash,
} from '../src/index';

describe('epub-parser', () => {
  it('Check imports', () => {
    assert(EpubParser.constructor !== null);
    assert(EpubBook.constructor !== null);
    assert(Errors !== null);
    assert(LogLevel !== null);
    assert(CryptoProvider.constructor !== null);
    assert(AesCryptor.constructor !== null);
    assert(Hash !== null);
  });
});
