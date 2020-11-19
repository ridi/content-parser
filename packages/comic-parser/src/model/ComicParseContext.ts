import type { BaseParseContext } from '@ridi/parser-core';
import type { BaseParserOption } from '@ridi/parser-core/type/BaseParseContext';
import type { ReadEntriesReturnType } from '@ridi/parser-core/type/readEntries';
import ComicBook from './ComicBook';

class ComicParseContext implements BaseParseContext<ComicBook> {
  options?: BaseParserOption | undefined;
  entries?: ReadEntriesReturnType;
  rawBook: ComicBook;
  constructor() {
    this.rawBook = new ComicBook();
  }

}

export default ComicParseContext;
