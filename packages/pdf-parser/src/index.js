import {
  CryptoProvider, AesCryptor, Hash,
  Errors,
  LogLevel,
} from '@ridi/parser-core';

import PdfParser from './PdfParser';
import Book from './model/Book';

export default {
  PdfParser,
  Errors,
  LogLevel,
  CryptoProvider,
  AesCryptor,
  Hash,
  PdfBook: Book,
};
