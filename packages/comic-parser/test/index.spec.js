import { assert } from 'chai';

import {
  ComicParser,
  ComicBook,
  Errors,
  LogLevel,
  CryptoProvider,
  Cryptor,
} from '../src/index';

describe('comic-parser', () => {
  it('Check imports', () => {
    assert(ComicParser.constructor !== null);
    assert(ComicBook.constructor !== null);
    assert(Errors !== null);
    assert(LogLevel !== null);
    assert(CryptoProvider.constructor !== null);
    assert(Cryptor.constructor !== null);
  });
});
