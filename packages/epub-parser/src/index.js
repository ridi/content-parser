import {
  CryptoProvider, AesCryptor,
  Errors,
  LogLevel,
} from '@ridi/parser-core';

import EpubParser from './EpubParser';
import Book from './model/Book';

export default {
  EpubParser,
  Errors,
  LogLevel,
  CryptoProvider,
  AesCryptor,
  EpubBook: Book,
};
