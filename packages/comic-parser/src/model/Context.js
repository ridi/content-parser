import Book from './Book';

class Context {
  constructor() {
    this.options = undefined;
    const rawBook = {};
    Object.keys(new Book()).forEach((key) => { rawBook[key] = undefined; });
    this.rawBook = rawBook;
  }
}

export default Context;
