import Zip from 'adm-zip';
import XmlParser from 'fast-xml-parser';
import fs from 'fs';
import he from 'he';
import path from 'path';

import Book from './model/Book';
import Context from './model/Context';
import Errors from './Errors';
import {
  getPropertyDescriptor,
  getPropertyKeys,
  isArray,
  isBuffer,
  isExists,
  objectMerge,
} from './utils';

const tagValueProcessor = value => he.decode(value);
const attrValueProcessor = value => he.decode(value, { isAttributeValue: true });

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
      // fast-xml-parser options.
      xmlParserOptions: {
        // Prepend given string to attribute name for identification.
        attributeNamePrefix: '@attr_',
        // (Valid name) Group all the attributes as properties of given name.
        attrNodeName: false,
        // Ignore attributes to be parsed.
        ignoreAttributes: false,
        // Remove namespace string from tag and attribute names.
        ignoreNameSpace: false,
        // A tag can have attributes without any value.
        allowBooleanAttributes: true,
        // Parse the value of text node to float, integer, or boolean.
        parseNodeValue: true,
        // Parse the value of an attribute to float, integer, or boolean.
        parseAttributeValue: true,
        // Trim string values of an attribute or node
        trimValues: true,
        // If specified, parser parse CDATA as nested tag instead of adding it's value to parent tag.
        cdataTagName: false,
        // If true then values like "+123", or "0123" will not be parsed as number.
        parseTrueNumberOnly: false,
        // Process tag value during transformation. Like HTML decoding, word capitalization, etc.
        // Applicable in case of string only.
        tagValueProcessor,
        // Process attribute value during transformation. Like HTML decoding, word capitalization, etc.
        // Applicable in case of string only.
        attrValueProcessor,
      },
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
    if (isExists(input) && typeof input === 'string') {
      if (!fs.existsSync(input)) {
        throw Errors.INVALID_FILE_PATH;
      } else if (fs.lstatSync(input).isDirectory() || !input.toLowerCase().endsWith('.epub')) {
        throw Errors.INVALID_FILE_TYPE;
      }
    } else if (!isExists(input) || !isBuffer(input)) {
      throw Errors.INVALID_INPUT;
    }
    this._input = input;
    getPropertyKeys(options).forEach((key) => {
      if (getPropertyDescriptor(EpubParser.defaultOptions, key) === undefined) {
        throw Errors.INVALID_OPTIONS;
      }
      if (key !== 'xmlParserOptions') {
        if (typeof options[key] !== EpubParser.defaultOptionTypes[key]) { // eslint-disable-line valid-typeof
          throw Errors.INVALID_OPTION_VALUE;
        }
      }
    });
    if (isBuffer(input) && isExists(options.unzipPath)) {
      throw Errors.FILE_PATH_INPUT_REQUIRED;
    }
    this._options = objectMerge(EpubParser.defaultOptions, options);
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
      if (context.options.shouldValidatePackage) {
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

  _findEntry(entryName, context) {
    return context.zip.getEntries().find(entry => entry.entryName === entryName);
  }

  _parseXml2Json(entry, options) {
    const { shouldXmlValidation, xmlParserOptions } = options;
    const xmlData = entry.getData().toString('utf8');
    if (shouldXmlValidation && !XmlParser.validate(xmlData)) {
      throw Errors.INVALID_XML;
    }
    return XmlParser.parse(xmlData, xmlParserOptions || {});
  }

  _parseMetaInf(context) {
    return new Promise((resolve) => {
      const containerEntry = this._findEntry('META-INF/container.xml', context);
      if (!isExists(containerEntry)) {
        throw Errors.META_INF_NOT_FOUND;
      }
      const result = this._parseXml2Json(containerEntry, context.options);
      if (!isExists(result.container) || !isExists(result.container.rootfiles)) {
        throw Errors.META_INF_NOT_FOUND;
      }
      const { rootfiles } = result.container;
      const rootfile = isArray(rootfiles) ? rootfiles[0] : rootfiles.rootfile;
      if (!isExists(rootfile)) {
        throw Errors.OPF_NOT_FOUND;
      }
      const opfPath = rootfile['@attr_full-path'];
      if (!isExists(opfPath) || !isExists(this._findEntry(opfPath, context))) {
        throw Errors.OPF_NOT_FOUND;
      }
      context.opfPath = opfPath;
      context.basePath = path.dirname(opfPath);
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
      resolve(new Book(context.rawBook)); 
    });
  }
}

export default EpubParser;
