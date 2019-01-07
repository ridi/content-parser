import { assert } from 'chai';

import {
  EpubParser,
  ComicParser,
  Errors,
  LogLevel,
  CryptoProvider,
  Cryptor,
} from '../src/index';

describe('content-parser', () => {
  it('check imports', () => {
    assert(EpubParser.constructor !== null);
    assert(ComicParser.constructor !== null);
    assert(Errors !== null);
    assert(LogLevel !== null);
    assert(CryptoProvider.constructor !== null);
    assert(Cryptor.constructor !== null);
  });
});
