import Zip from 'adm-zip';
import fs from 'fs';

import Book from './model/Book';
import Context from './model/Context';
import Errors from './Errors';

/* eslint-disable no-param-reassign */
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
      // Path to uncompress. Valid only when input is epub path.
      unzipPath: undefined,
      // If true, creates intermediate directories for the unzipPath.
      createIntermediateDirectories: true,
      // If true, removes a previous file from the unzipPath.
      removePreviousFile: true,
    };
  }

  static get defaultOptionTypes() {
    return {
      shouldValidatePackage: 'boolean',
      shouldXmlValidation: 'boolean',
      allowNcxFileMissing: 'boolean',
      unzipPath: 'string',
      createIntermediateDirectories: 'boolean',
      removePreviousFile: 'boolean',
    };
  }

  constructor(input, options = {}) {
    if (input && typeof input === 'string') {
      if (!fs.existsSync(input)) {
        throw Errors.INVALID_FILE_PATH;
      } else if (fs.lstatSync(input).isDirectory() || !input.toLowerCase().endsWith('.epub')) {
        throw Errors.INVALID_FILE_TYPE;
      }
    } else if (!input || !Buffer.isBuffer(input)) {
      throw Errors.INVALID_INPUT;
    }
    this._input = input;
    Object.getOwnPropertyNames(options).forEach((key) => {
      if (Object.getOwnPropertyDescriptor(EpubParser.defaultOptions, key) === undefined) {
        throw Errors.INVALID_OPTIONS;
      }
      if (typeof options[key] !== EpubParser.defaultOptionTypes[key]) { // eslint-disable-line valid-typeof
        throw Errors.INVALID_OPTION_VALUE;
      }
    });
    if (Buffer.isBuffer(input) && options.unzipPath) {
      throw Errors.FILE_PATH_INPUT_REQUIRED;
    }
    this._options = Object.assign({}, EpubParser.defaultOptions, options);
  }

  parse() {
    return this._prepare()
      .then(context => this._validatePackageIfNeeded(context))
      .then(context => this._parseMetaInf(context))
      .then(context => this._parseOpf(context))
      .then(context => this._parseNcx(context))
      .then(context => this._createBook(context))
      .then(context => this._unzipIfNeeded(context))
      .then(book => book);
  }

  _prepare() {
    return new Promise((resolve) => {
      const context = new Context();
      context.options = this._options;
      context.zip = new Zip(this._input);
      resolve(context);
    });
  }

  _validatePackageIfNeeded(context) {
    return new Promise((resolve) => {
      if (context.options.shouldValidatePackage) { // eslint-disable-line react/destructuring-assignment
        const firstEntry = context.zip.getEntries()[0];
        if (firstEntry.entryName !== 'mimetype') {
          // The mimetype file must be the first file in the archive.
          throw Errors.INVALID_PACKAGE;
        } else if (firstEntry.header.method !== 0/* adm-zip/util/constants.js/STORED */) {
          // The mimetype file should not compressed.
          throw Errors.INVALID_PACKAGE;
        } else if (firstEntry.getData().toString('utf8') !== 'application/epub+zip') {
          // The mimetype file should only contain the string 'application/epub+zip'.
          throw Errors.INVALID_PACKAGE;
        } else if (firstEntry.header.extraLength > 0) {
          // Should not use extra field feature of the ZIP format for the mimetype file.
          throw Errors.INVALID_PACKAGE;
        }
        context.verified = true;
      }
      resolve(context);
    });
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

  _unzipIfNeeded(context) {
    return new Promise((resolve, reject) => {
      resolve(context);
    });
  }

  _createBook(context) {
    return new Promise((resolve, reject) => {
      resolve(new Book(context.rawBook)); // eslint-disable-line react/destructuring-assignment
    });
  }
}

export default EpubParser;
