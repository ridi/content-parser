import Zip from 'adm-zip';
import Book from './model/Book';
import Context from './model/Context';

class EpubParser {
  static get defaultOptions() {
    return {
      shouldEpubFileSignatureValidation: false,
      shouldMimetypeFileValidation: false,
      shouldXMLValidation: false,
    };
  }

  constructor(input, options) {
    this._input = input;
    this._options = Object.assign({}, EpubParser.defaultOptions, options);
  }

  parse(success, error) {
    this._prepare()
      .then(context => this._parseMetaInf(context))
      .then(context => this._parseOpf(context))
      .then(context => this._parseNcx(context))
      .then(context => this._createBook(context))
      .then((book) => {
        success(book);
      })
      .catch(exception => error(exception));
  }

  _prepare() {
    return new Promise((resolve, reject) => {
      const context = new Context();
      context.options = this._options;
      context.zip = new Zip(this._input);
      resolve(context);
    });
  }

  _validateEpubFileSignature(context) {
    return false;
  }

  _validateMimetypeFile(context, item) {
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
