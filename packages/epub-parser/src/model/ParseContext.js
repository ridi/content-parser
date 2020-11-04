import Book from './Book';

class ParseContext {
  constructor() {
    this.options = undefined;
    this.entries = undefined;
    const rawBook = {};
    Object.keys(new Book()).forEach((key) => { rawBook[key] = undefined; });
    this.rawBook = rawBook;
    this.opfPath = undefined;
    this.basePath = undefined;
    this.foundCover = false;
  }
}

export default ParseContext;
