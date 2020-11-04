import Book from './Book';

class Context {
  constructor() {
    this.options = undefined;
    this.entries = undefined;
    const rawBook = {};
    Object.keys(new Book()).forEach((key) => { rawBook[key] = undefined; });
    this.rawBook = rawBook;
    this.document = undefined;
    this.worker = undefined;
  }
}

export default Context;
