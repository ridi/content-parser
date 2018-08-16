import Book from './Book';
import { getPropertyKeys } from '../utils';

class Context {
  constructor() {
    this.options = undefined;
    this.zip = undefined;
    this.opfPath = undefined;
    this.basePath = undefined;
    const rawBook = {};
    getPropertyKeys(new Book()).forEach((key) => { rawBook[key] = undefined; });
    this.rawBook = rawBook;
  }
}

export default Context;
