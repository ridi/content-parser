import Zip from 'adm-zip';
import XmlParser from 'fast-xml-parser';
import fs from 'fs';
import he from 'he';
import path from 'path';

import Book from './model/Book';
import Context from './model/Context';
import CssItem from './model/CssItem';
import FontItem from './model/FontItem';
import ImageItem from './model/ImageItem';
import Item from './model/Item';
import NcxItem from './model/NcxItem';
import SpineItem from './model/SpineItem';
import Errors from './Errors';
import {
  getPropertyDescriptor,
  getPropertyKeys,
  isArray,
  isBuffer,
  isExists,
  isObject,
  isString,
  objectMerge,
} from './utils';

const textNodeName = '#text';
const attributeNamePrefix = '@attr_';
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
        // Text node name for identification.
        textNodeName,
        // Prepend given string to attribute name for identification.
        attributeNamePrefix,
        // (Valid name) Group all the attributes as properties of given name.
        attrNodeName: false,
        // Ignore attributes to be parsed.
        ignoreAttributes: false,
        // Remove namespace string from tag and attribute names.
        ignoreNameSpace: true,
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
      xmlParserOptions: 'object',
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
      if (typeof options[key] !== EpubParser.defaultOptionTypes[key]) { // eslint-disable-line valid-typeof
        throw Errors.INVALID_OPTION_VALUE;
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

  _xmlEntry2Json(entry, options) {
    const { shouldXmlValidation, xmlParserOptions } = options;
    const xmlData = entry.getData().toString('utf8');
    if (shouldXmlValidation && isExists(XmlParser.validate(xmlData).err)) {
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

      const { container } = this._xmlEntry2Json(containerEntry, context.options);
      if (!isExists(container) || !isExists(container.rootfiles)) {
        throw Errors.META_INF_NOT_FOUND;
      }

      const { rootfiles } = container;
      // eslint-disable-next-line arrow-body-style
      const rootfile = (isArray(rootfiles) ? rootfiles : [rootfiles.rootfile]).find((item) => {
        return item[`${attributeNamePrefix}media-type`] === 'application/oebps-package+xml';
      });
      if (!isExists(rootfile)) {
        throw Errors.META_INF_NOT_FOUND;
      }

      const opfPath = rootfile[`${attributeNamePrefix}full-path`];
      if (!isExists(opfPath)) {
        throw Errors.META_INF_NOT_FOUND;
      }

      context.opfPath = opfPath;
      context.basePath = path.dirname(opfPath);

      resolve(context);
    });
  }

  _normalizeKey(obj, valueKey) {
    if (isString(obj)) {
      return obj;
    }
    const newObj = {};
    getPropertyKeys(obj).forEach((key) => {
      let newKey = key;
      if (isExists(valueKey) && key === textNodeName) {
        newKey = key.replace(textNodeName, valueKey);
      } else {
        newKey = key.replace(attributeNamePrefix, '');
      }
      newObj[newKey] = isObject(obj[key]) ? this._normalizeKey(obj[key]) : obj[key];
    });
    return newObj;
  }

  _makeValues(any, valueKey) {
    if (!isExists(any)) {
      return [];
    }
    return isArray(any) ? any.map(item => this._normalizeKey(item, valueKey)) : [this._normalizeKey(any, valueKey)];
  }

  _getItemType(mediaType) {
    const types = {
      'application/font': FontItem.name,
      'application/font-otf': FontItem.name,
      'application/font-sfnt': FontItem.name,
      'application/font-woff': FontItem.name,
      'application/vnd.ms-opentype': FontItem.name,
      'application/x-font-ttf': FontItem.name,
      'application/x-font-truetype': FontItem.name,
      'application/x-font-opentype': FontItem.name,
      'application/x-dtbncx+xml': NcxItem.name,
      'application/xhtml+xml': SpineItem.name,
      'font/opentype': FontItem.name,
      'font/otf': FontItem.name,
      'font/woff2': FontItem.name,
      'image/gif': ImageItem.name,
      'image/jpeg': ImageItem.name,
      'image/png': ImageItem.name,
      'image/bmp': ImageItem.name, // Not recommended in EPUB spec.
      'image/svg+xml': ImageItem.name,
      'text/css': CssItem.name,
    };
    const type = types[mediaType.toLowerCase()];
    if (!isExists(type)) {
      return Item.name;
    }
    return type;
  }

  _parseOpf(context) {
    return new Promise((resolve) => {
      const opfEntry = this._findEntry(context.opfPath, context);
      if (!isExists(opfEntry)) {
        throw Errors.OPF_NOT_FOUND;
      }

      const { package: root } = this._xmlEntry2Json(opfEntry, context.options);
      if (!isExists(root) || !isExists(root.metadata) || !isExists(root.manifest) || !isExists(root.spine)) {
        throw Errors.INVALID_OPF;
      }

      const { rawBook } = context;
      rawBook.epubVersion = root[`${attributeNamePrefix}version`];

      const {
        title, creator, subject, description, publisher, contributor, date, type,
        format, identifier, source, language, relation, coverage, rights,
      } = root.metadata;
      rawBook.titles = this._makeValues(title);
      rawBook.creators = this._makeValues(creator, 'name');
      rawBook.subjects = this._makeValues(subject);
      rawBook.description = description;
      rawBook.publisher = publisher;
      rawBook.contributors = this._makeValues(contributor, 'name');
      rawBook.dates = this._makeValues(date, 'value');
      rawBook.type = type;
      rawBook.format = format;
      rawBook.identifiers = this._makeValues(identifier, 'value');
      rawBook.source = source;
      rawBook.language = language;
      rawBook.relation = relation;
      rawBook.coverage = coverage;
      rawBook.rights = rights;

      rawBook.items = [];
      this._makeValues(root.manifest.item).forEach((item) => {
        const rawItem = {};
        rawItem.id = item.id;
        rawItem.href = item.href;
        rawItem.mediaType = item['media-type'];
        rawItem.itemType = this._getItemType(rawItem.mediaType);

        const entryName = path.join(context.basePath, rawItem.href);
        const itemEntry = this._findEntry(entryName, context);
        if (isExists(itemEntry)) {
          rawItem.compressedSize = itemEntry.header.compressedSize;
          rawItem.uncompressedSize = itemEntry.header.size;
        }

        rawBook.items.push(rawItem);
      });

      let spineIndex = 0;
      const itemref = this._makeValues(root.spine.itemref);
      const tocId = root.spine[`${attributeNamePrefix}toc`];
      rawBook.items.forEach((item) => {
        if (item.itemType === NcxItem.name) {
          if (item.id !== tocId) {
            item.itemType = Item.name;
          }
        } else if (item.itemType === SpineItem.name) {
          const ref = itemref.find(o => o.idref === item.id);
          if (isExists(ref)) {
            item.spineIndex = spineIndex;
            item.isLinear = ref.linear;
            if (!isExists(item.isLinear)) {
              item.isLinear = true;
            }
            spineIndex += 1;
          } else {
            item.itemType = Item.name;
          }
        }
      });

      rawBook.guide = [];
      if (isExists(root.guide)) {
        this._makeValues(root.guide.reference).forEach(reference => rawBook.guide.push(reference));
      }

      resolve(context);
    });
  }

  _parseNcx(context) {
    return new Promise((resolve) => {
      const { allowNcxFileMissing } = context.options;
      const ncxItem = context.rawBook.items.find(item => item.itemType === NcxItem.name);
      if (isExists(ncxItem)) {
        const entryName = path.join(context.basePath, ncxItem.href);
        const ncxEntry = this._findEntry(entryName, context);
        if (!allowNcxFileMissing && !isExists(ncxEntry)) {
          throw Errors.NCX_NOT_FOUND;
        }

        const { ncx } = this._xmlEntry2Json(ncxEntry, context.options);
        if (!isExists(ncx) || !isExists(ncx.navMap)) {
          throw Errors.INVALID_NCX;
        }

        ncxItem.navPoints = [];
        this._makeValues(ncx.navMap.navPoint).forEach((navPoint) => {
          const { id, navLabel, content } = navPoint;
          ncxItem.navPoints.push({
            id,
            label: navLabel.text,
            src: content.src,
          });
        });
      } else if (!allowNcxFileMissing) {
        throw Errors.NCX_NOT_FOUND;
      }
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
