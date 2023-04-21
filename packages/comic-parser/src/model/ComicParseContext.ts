import { BaseBook, BaseParseContext } from "@ridi/parser-core";

import ComicBook from "./ComicBook";

class ComicParseContext extends BaseParseContext {
  rawBook: any;

  constructor() {
    super();
    const rawBook = {};
    Object.keys(new ComicBook()).forEach((key) => {
      rawBook[key] = undefined;
    });
    this.rawBook = rawBook;
  }
}

export default ComicParseContext;
