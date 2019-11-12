import {
  CryptoProvider, AesCryptor, Hash,
  Errors,
  LogLevel,
} from '@ridi/parser-core';

import ComicParser from './ComicParser';
import Book from './model/Book';

export default {
  ComicParser,
  Errors,
  LogLevel,
  CryptoProvider,
  AesCryptor,
  Hash,
  ComicBook: Book,
};
