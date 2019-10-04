import {
  CryptoProvider, AesCryptor, Hash,
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
  Hash,
  EpubBook: Book,
};
