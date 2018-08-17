import Zip from 'adm-zip';
import XmlParser from 'fast-xml-parser';
import fs from 'fs';
import he from 'he';
import path from 'path';

import Book from './model/Book';
import Context from './model/Context';
import CssItem from './model/CssItem';
import FontItem from './model/FontItem';
import Guide from './model/Guide';
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
  createDirectory,
  removeDirectory,
  safePathJoin,
  getSubpathes,
} from './utils';

const privateProps = new WeakMap();

const textNodeName = '#text';
const attributeNamePrefix = '@attr_';
const tagValueProcessor = value => he.decode(value);
const attrValueProcessor = value => he.decode(value, { isAttributeValue: true });

const findEntry = (entryName, entries) => entries.find(entry => entry.entryName === entryName);

const normalizeKey = (obj, mapping = {}) => {
  if (isString(obj)) {
    return obj;
  }
  const newObj = {};
  getPropertyKeys(obj).forEach((key) => {
    let shouldMakeArray = false;
    let newKey = key.replace(attributeNamePrefix, '');
    if (isExists(mapping[newKey])) {
      shouldMakeArray = mapping[newKey].isArray || false;
      newKey = mapping[newKey].key;
    }
    let value = obj[key];
    if (isArray(value)) {
      value = makeSafeValues(value, mapping); // eslint-disable-line no-use-before-define
    } else if (isObject(value)) {
      if (shouldMakeArray) {
        value = [normalizeKey(value, mapping)];
      } else {
        value = normalizeKey(value, mapping);
      }
    }
    newObj[newKey] = value;
  });
  return newObj;
};

const makeSafeValues = (any, mapping = {}) => {
  if (!isExists(any)) {
    return [];
  }
  return isArray(any) ? any.map(item => normalizeKey(item, mapping)) : [normalizeKey(any, mapping)];
};

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
        parseNodeValue: false,
        // Parse the value of an attribute to float, integer, or boolean.
        parseAttributeValue: false,
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
      // Path to uncompress.
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

  get input() { return privateProps.get(this).input; }

  get options() { return privateProps.get(this).options; }

  constructor(input, options = {}) {
    if (isString(input)) {
      if (!fs.existsSync(input)) {
        throw Errors.PATH_NOT_FOUND;
      }
    } else if (!isExists(input) || !isBuffer(input)) {
      throw Errors.INVALID_INPUT;
    }
    getPropertyKeys(options).forEach((key) => {
      if (!isExists(getPropertyDescriptor(EpubParser.defaultOptions, key))) {
        throw Errors.INVALID_OPTIONS;
      }
      if (typeof options[key] !== EpubParser.defaultOptionTypes[key]) { // eslint-disable-line valid-typeof
        throw Errors.INVALID_OPTION_VALUE;
      }
      if (key === 'xmlParserOptions') {
        const xmlParserOptions = options[key];
        const { textNodeName: op1, attributeNamePrefix: op2 } = xmlParserOptions;
        if (isExists(op1) || isExists(op2)) {
          throw Errors.INVALID_OPTIONS;
        }
      }
    });
    privateProps.set(this, {
      input,
      options: objectMerge(EpubParser.defaultOptions, options),
    });
  }

  parse() {
    return this._prepare()
      .then(context => this._validatePackageIfNeeded(context))
      .then(context => this._parseMetaInf(context))
      .then(context => this._parseOpf(context))
      .then(context => this._parseNcx(context))
      .then(context => this._unzipIfNeeded(context))
      .then(context => this._createBook(context))
      .then(book => book);
  }

  _getEntries(input) {
    if (!isString(input)) {
      return input.getEntries().reduce((entries, entry) => { // eslint-disable-line arrow-body-style
        return entries.concat([{
          entryName: entry.entryName,
          getFile: (encoding) => { // eslint-disable-line arrow-body-style
            return isExists(encoding) ? entry.getData().toString(encoding) : entry.getData();
          },
          getSize: () => entry.header.size,
          method: entry.header.method,
          extraLength: entry.header.extraLength,
        }]);
      }, []);
    }
    return getSubpathes(input).reduce((entries, subpath) => { // eslint-disable-line arrow-body-style
      return entries.concat([{
        entryName: subpath.substring(input.length + path.sep.length),
        getFile: encoding => fs.readFileSync(subpath, encoding),
        getSize: () => fs.lstatSync(subpath).size,
      }]);
    }, []);
  }

  _xmlEntry2Json(entry, options) {
    const { shouldXmlValidation, xmlParserOptions } = options;
    const xmlData = entry.getFile('utf8');
    if (shouldXmlValidation && isExists(XmlParser.validate(xmlData).err)) {
      throw Errors.INVALID_XML;
    }
    return XmlParser.parse(xmlData, xmlParserOptions || {});
  }

  _prepare() {
    return new Promise((resolve) => {
      const { input, options } = this;
      const context = new Context();
      if (isBuffer(input) || fs.lstatSync(input).isFile()) {
        const zip = new Zip(input);
        context.entries = this._getEntries(zip);
        context.zip = zip;
      } else {
        context.entries = this._getEntries(input);
      }
      context.options = options;
      resolve(context);
    });
  }

  _validatePackageIfNeeded(context) {
    return new Promise((resolve) => {
      if (isExists(context.zip) && context.options.shouldValidatePackage) {
        const firstEntry = context.entries[0];
        if (firstEntry.entryName !== 'mimetype') {
          // The mimetype file must be the first file in the archive.
          throw Errors.INVALID_PACKAGE;
        } else if (firstEntry.method !== 0/* adm-zip/util/constants.js/STORED */) {
          // The mimetype file should not compressed.
          throw Errors.INVALID_PACKAGE;
        } else if (firstEntry.getFile('utf8') !== 'application/epub+zip') {
          // The mimetype file should only contain the string 'application/epub+zip'.
          throw Errors.INVALID_PACKAGE;
        } else if (firstEntry.extraLength > 0) {
          // Should not use extra field feature of the ZIP format for the mimetype file.
          throw Errors.INVALID_PACKAGE;
        }
      }
      resolve(context);
    });
  }

  _parseMetaInf(context) {
    return new Promise((resolve) => {
      const containerEntry = findEntry('META-INF/container.xml', context.entries);
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

  _getItemType(mediaType) {
    const types = {
      'application/font': FontItem,
      'application/font-otf': FontItem,
      'application/font-sfnt': FontItem,
      'application/font-woff': FontItem,
      'application/vnd.ms-opentype': FontItem,
      'application/x-font-ttf': FontItem,
      'application/x-font-truetype': FontItem,
      'application/x-font-opentype': FontItem,
      'application/x-dtbncx+xml': NcxItem,
      'application/xhtml+xml': SpineItem,
      'font/opentype': FontItem,
      'font/otf': FontItem,
      'font/woff2': FontItem,
      'image/gif': ImageItem,
      'image/jpeg': ImageItem,
      'image/png': ImageItem,
      'image/bmp': ImageItem, // Not recommended in EPUB spec.
      'image/svg+xml': ImageItem,
      'text/css': CssItem,
    };
    const type = types[mediaType.toLowerCase()];
    if (!isExists(type)) {
      return Item;
    }
    return type;
  }

  _parseOpf(context) {
    return new Promise((resolve) => {
      const opfEntry = findEntry(context.opfPath, context.entries);
      if (!isExists(opfEntry)) {
        throw Errors.OPF_NOT_FOUND;
      }

      const { package: root } = this._xmlEntry2Json(opfEntry, context.options);
      if (!isExists(root) || !isExists(root.metadata) || !isExists(root.manifest) || !isExists(root.spine)) {
        throw Errors.INVALID_OPF;
      }

      const { rawBook } = context;
      rawBook.epubVersion = parseFloat(root[`${attributeNamePrefix}version`]);

      const {
        title, creator, subject, description, publisher, contributor, date, type,
        format, identifier, source, language, relation, coverage, rights, meta,
      } = root.metadata;
      const mapping = {};
      rawBook.titles = makeSafeValues(title);
      mapping[textNodeName] = { key: 'name' };
      rawBook.creators = makeSafeValues(creator, mapping);
      rawBook.subjects = makeSafeValues(subject);
      rawBook.description = description;
      rawBook.publisher = publisher;
      rawBook.contributors = makeSafeValues(contributor, mapping);
      mapping[textNodeName] = { key: 'value' };
      rawBook.dates = makeSafeValues(date, mapping);
      rawBook.type = type;
      rawBook.format = format;
      rawBook.identifiers = makeSafeValues(identifier, mapping);
      rawBook.source = source;
      rawBook.language = language;
      rawBook.relation = relation;
      rawBook.coverage = coverage;
      rawBook.rights = rights;
      rawBook.metas = makeSafeValues(meta);

      rawBook.items = [];
      const coverMeta = rawBook.metas.find(item => item.name.toLowerCase() === 'cover');
      let foundCover = false;
      makeSafeValues(root.manifest.item).forEach((item) => {
        const rawItem = {};
        rawItem.id = item.id;
        if (isExists(item.href) && item.href.length > 0) {
          rawItem.href = safePathJoin(context.basePath, item.href);
        } else {
          rawItem.href = item.href;
        }
        rawItem.mediaType = item['media-type'];
        rawItem.itemType = this._getItemType(rawItem.mediaType);

        const itemEntry = findEntry(rawItem.href, context.entries);
        if (isExists(itemEntry)) {
          rawItem.size = itemEntry.getSize();
        }

        if (!foundCover && isExists(coverMeta) && rawItem.id === coverMeta.content && rawItem.itemType === ImageItem) {
          rawItem.isCover = true;
          foundCover = true;
        }

        rawBook.items.push(rawItem);
      });

      let spineIndex = 0;
      const itemref = makeSafeValues(root.spine.itemref);
      const tocId = root.spine[`${attributeNamePrefix}toc`];
      rawBook.items.forEach((item) => {
        if (item.itemType === NcxItem) {
          if (item.id !== tocId) {
            item.itemType = Item;
          }
        } else if (item.itemType === SpineItem) {
          const ref = itemref.find(ir => ir.idref === item.id);
          if (isExists(ref)) {
            item.spineIndex = spineIndex;
            item.isLinear = ref.linear;
            if (!isExists(item.isLinear)) {
              item.isLinear = true;
            }
            spineIndex += 1;
          } else {
            item.itemType = Item;
          }
        } else if (!foundCover && item.itemType === ImageItem && item.id.toLowerCase() === 'cover') {
          item.isCover = true;
          foundCover = true;
        }
      });

      rawBook.guide = [];
      if (isExists(root.guide)) {
        let coverGuide;
        makeSafeValues(root.guide.reference).forEach((reference) => {
          if (!isExists(coverGuide) && isExists(reference.type) && reference.type.toLowerCase() === Guide.Types.COVER) {
            coverGuide = reference;
          }
          rawBook.guide.push(objectMerge(reference, { href: safePathJoin(context.basePath, reference.href) }));
        });
        if (!foundCover && isExists(coverGuide)) {
          const imageItem = rawBook.items.find(item => item.href === coverGuide.href && item.itemType === ImageItem);
          if (isExists(imageItem)) {
            imageItem.isCover = true;
            foundCover = true;
          }
        }
      }

      resolve(context);
    });
  }

  _parseNcx(context) {
    return new Promise((resolve) => {
      const { allowNcxFileMissing } = context.options;
      const ncxItem = context.rawBook.items.find(item => item.itemType === NcxItem);
      if (isExists(ncxItem)) {
        const ncxEntry = findEntry(ncxItem.href, context.entries);
        if (!allowNcxFileMissing && !isExists(ncxEntry)) {
          throw Errors.NCX_NOT_FOUND;
        }

        const { ncx } = this._xmlEntry2Json(ncxEntry, context.options);
        if (!isExists(ncx) || !isExists(ncx.navMap)) {
          throw Errors.INVALID_NCX;
        }

        ncxItem.navPoints = [];
        const mapping = { navPoint: { key: 'children', isArray: true } };
        const normalizeSrc = (np) => {
          if (isExists(np.children)) {
            np.children.forEach((child, idx) => {
              np.children[idx] = normalizeSrc(child);
            });
          }
          if (isExists(np.content) && isExists(np.content.src) && np.content.src.length > 0) {
            np.content.src = safePathJoin(context.basePath, np.content.src);
          }
          return np;
        };
        makeSafeValues(ncx.navMap.navPoint, mapping).forEach((navPoint) => { // eslint-disable-line arrow-body-style
          return ncxItem.navPoints.push(normalizeSrc(navPoint));
        });
      } else if (!allowNcxFileMissing) {
        throw Errors.NCX_NOT_FOUND;
      }
      resolve(context);
    });
  }

  _unzipIfNeeded(context) {
    return new Promise((resolve) => {
      const { options, zip } = context;
      const { unzipPath, removePreviousFile, createIntermediateDirectories } = options;
      if (isExists(zip) && isExists(unzipPath)) {
        if (removePreviousFile) {
          removeDirectory(unzipPath);
        }
        if (createIntermediateDirectories) {
          createDirectory(unzipPath);
        }
        zip.extractAllTo(unzipPath, false);
      }
      resolve(context);
    });
  }

  _createBook(context) {
    return new Promise((resolve) => {
      resolve(new Book(context.rawBook));
    });
  }
}

export default EpubParser;
