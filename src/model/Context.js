import Book from './Book';

class Context {
  get options() { return this._options; }

  set options(val) { this._options = val; }

  get zip() { return this._zip; }

  set zip(val) { this._zip = val; }

  get opfPath() { return this._opfPath; }

  set opfPath(val) { this._opfPath = val; }

  get basePath() { return this._basePath; }

  set basePath(val) { this._basePath = val; }

  get rawBook() { return this._rawBook; }

  constructor() {
    this._rawBook = Book.defaultProps;
  }
}

export default Context;
