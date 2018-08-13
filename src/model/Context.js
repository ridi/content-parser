import Book from './Book';

class Context {
  constructor() {
    this.options = undefined;
    this.zip = undefined;
    this.verified = undefined; // Only valid if shouldValidatePackage is true.
    this.unzipped = undefined; // Only valid if input is epub path.
    this.opfPath = undefined;
    this.basePath = undefined;
    const rawBook = {};
    Object.getOwnPropertyNames(new Book()).forEach((key) => { rawBook[key] = undefined; });
    this.rawBook = rawBook;
  }
}

export default Context;
