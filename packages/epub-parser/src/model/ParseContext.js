import Book from './Book';

class ParseContext {
  constructor() {
    this.options = undefined;
    this.entries = undefined;
    this.opfPath = undefined;
    this.basePath = undefined;
    this.foundCover = false;
    const rawBook = {};
    Object.keys(new Book()).forEach((key) => { rawBook[key] = undefined; });
    this.rawBook = rawBook;
  }
}

export default ParseContext;
