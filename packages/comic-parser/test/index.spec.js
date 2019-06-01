import { assert } from 'chai';

import {
  ComicParser,
  ComicBook,
  Errors,
  LogLevel,
  CryptoProvider,
  AesCryptor,
} from '../src/index';

describe('comic-parser', () => {
  it('Check imports', () => {
    assert(ComicParser.constructor !== null);
    assert(ComicBook.constructor !== null);
    assert(Errors !== null);
    assert(LogLevel !== null);
    assert(CryptoProvider.constructor !== null);
    assert(AesCryptor.constructor !== null);
  });
});
