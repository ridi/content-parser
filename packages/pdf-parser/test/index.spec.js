import { assert } from 'chai';

import {
  PdfParser,
  PdfBook,
  Errors,
  LogLevel,
  CryptoProvider,
  AesCryptor,
} from '../src/index';

describe('pdf-parser', () => {
  it('Check imports', () => {
    assert(PdfParser.constructor !== null);
    assert(PdfBook.constructor !== null);
    assert(Errors !== null);
    assert(LogLevel !== null);
    assert(CryptoProvider.constructor !== null);
    assert(AesCryptor.constructor !== null);
  });
});
