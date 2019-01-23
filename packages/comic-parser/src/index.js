import {
  CryptoProvider, Cryptor,
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
  Cryptor,
  ComicBook: Book,
};
