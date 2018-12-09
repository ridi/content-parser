import Book from './Book';

class Context {
  constructor() {
    this.options = undefined;
    this.opfPath = undefined;
    this.basePath = undefined;
    this.foundCover = false;
    const rawBook = {};
    Object.keys(new Book()).forEach((key) => { rawBook[key] = undefined; });
    this.rawBook = rawBook;
  }
}

export default Context;
