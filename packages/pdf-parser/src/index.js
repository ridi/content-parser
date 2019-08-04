import {
  CryptoProvider, AesCryptor,
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
  PdfBook: Book,
};
