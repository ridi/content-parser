import Zip from 'adm-zip';

import Book from './model/Book';
import Context from './model/Context';

class EpubParser {
  static get defaultOptions() {
    return {
      // If true, validation the package specifications in the IDPF listed below.
      // - The Zip header should not corrupt.
      // - The mimetype file must be the first file in the archive.
      // - The mimetype file should not compressed.
      // - The mimetype file should only contain the string 'application/epub+zip'.
      // - Should not use extra field feature of the ZIP format for the mimetype file.
      shouldValidatePackage: false,
      // If true, stop parsing when XML parsing errors occur.
      shouldXmlValidation: false,
      // If false, stop parsing when NCX file not exists.
      allowNcxFileMissing: true,
      // Path to uncompress. Valid only when input is path.
      unzipPath: undefined,
    };
  }

  constructor(input, options) {
    this._input = input;
    this._options = Object.assign({}, EpubParser.defaultOptions, options);
  }

  parse() {
    return this._prepare()
      .then(context => this._parseMetaInf(context))
      .then(context => this._parseOpf(context))
      .then(context => this._parseNcx(context))
      .then(context => this._createBook(context))
      .then(book => book);
  }

  _prepare() {
    return new Promise((resolve, reject) => {
      const context = new Context();
      context.options = this._options;
      context.zip = new Zip(this._input);
      resolve(context);
    });
  }

  _validatePackage(context, item) {
    return false;
  }

  _parseMetaInf(context) {
    return new Promise((resolve, reject) => {
      resolve(context);
    });
  }

  _parseOpf(context) {
    return new Promise((resolve, reject) => {
      resolve(context);
    });
  }

  _parseNcx(context) {
    return new Promise((resolve, reject) => {
      resolve(context);
    });
  }

  _createBook(context) {
    return new Promise((resolve, reject) => {
      resolve(new Book(context));
    });
  }
}

export default EpubParser;
