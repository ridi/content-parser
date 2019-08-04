import { assert } from 'chai';

import {
  EpubParser,
  EpubBook,
  ComicParser,
  ComicBook,
  PdfParser,
  PdfBook,
  Errors,
  LogLevel,
  CryptoProvider,
  AesCryptor,
} from '../src/index';

describe('content-parser', () => {
  it('Check imports', () => {
    assert(EpubParser.constructor !== null);
    assert(EpubBook.constructor !== null);
    assert(ComicParser.constructor !== null);
    assert(ComicBook.constructor !== null);
    assert(PdfParser.constructor !== null);
    assert(PdfBook.constructor !== null);
    assert(Errors !== null);
    assert(LogLevel !== null);
    assert(CryptoProvider.constructor !== null);
    assert(AesCryptor.constructor !== null);
  });
});
