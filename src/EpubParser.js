import Zip from 'adm-zip';
import fs from 'fs';
import parse5 from 'parse5';
import path from 'path';

import Errors from './Errors';
import Book from './model/Book';
import Context from './model/Context';
import CssItem from './model/CssItem';
import DeadItem from './model/DeadItem';
import FontItem from './model/FontItem';
import Guide from './model/Guide';
import ImageItem from './model/ImageItem';
import InlineCssItem from './model/InlineCssItem';
import Item from './model/Item';
import NcxItem from './model/NcxItem';
import SpineItem from './model/SpineItem';
import spineLoader from './loader/spineLoader';
import xmlLoader, { getValues, textNodeName } from './loader/xmlLoader';
import {
  isArray,
  isBuffer,
  isExists,
  isString,
  isUrl,
  mergeObjects,
  validateOptions,
  createDirectory,
  removeDirectory,
  removeLastPathComponent,
  safePathJoin,
  getPathes,
} from './utils';

const privateProps = new WeakMap();

const findEntry = (entryName, entries) => entries.find(entry => entry.entryName === entryName);

const defaultExtractAdapter = (result) => {
  let string = '';
  result.attrs.forEach((attr) => {
    string += ` ${attr.name}=\"${attr.value}\"`; // eslint-disable-line no-useless-escape
  });
  return {
    content: `<article${string}>${result.body}</article>`,
  };
};

class EpubParser {
  static get parseDefaultOptions() {
    return {
      // If true, validation the package specifications in the IDPF listed below.
      // - The Zip header should not corrupt.
      // - The mimetype file must be the first file in the archive.
      // - The mimetype file should not compressed.
      // - The mimetype file should only contain the string 'application/epub+zip'.
      // - Should not use extra field feature of the ZIP format for the mimetype file.
      validatePackage: false,
      // If true, stop parsing when XML parsing errors occur.
      validateXml: false,
      // If false, stop parsing when NCX file not exists.
      allowNcxFileMissing: true,
      // If specified, uncompress to that path. (Only if input is buffer or epub file path.)
      unzipPath: undefined,
      // If true, creates intermediate directories for the unzipPath.
      createIntermediateDirectories: true,
      // If true, removes a previous file from the unzipPath.
      removePreviousFile: true,
      // If true, ignore the spineIndex difference caused by the isLinear property of the SpineItem.
      // e.g. If left is false, right is true.
      //  [{ spineIndex: 0, isLinear: true, ... },       [{ spineIndex: 0, isLinear: true, ... },
      //   { spineIndex: 1, isLinear: true, ... },        { spineIndex: 1, isLinear: true, ... },
      //   { spineIndex: -1, isLinear: false, ... },      { spineIndex: 2, isLinear: false, ... },
      //   { spineIndex: 2, isLinear: true, ... }]        { spineIndex: 3, isLinear: true, ... }]
      ignoreLinear: false,
      // If true, One namespace is given per CSS file or inline style, and styles used for spine is described.
      // Otherwise it CssItem.namespace, SpineItem.styles is undefined.
      // In any list, InlineCssItem is always positioned after CssItem. (Book.styles, Book.items, SpineItem.styles, ...)
      useStyleNamespace: false,
      // Prepend given string to namespace for identification.
      styleNamespacePrefix: 'ridi_c',
    };
  }

  static get parseOptionTypes() {
    return {
      validatePackage: 'boolean',
      validateXml: 'boolean',
      allowNcxFileMissing: 'boolean',
      unzipPath: 'string|undefined',
      createIntermediateDirectories: 'boolean',
      removePreviousFile: 'boolean',
      ignoreLinear: 'boolean',
      useStyleNamespace: 'boolean',
      styleNamespacePrefix: 'string',
    };
  }

  static get readDefaultOptions() {
    return {
      // If specified then returns a string. Otherwise it returns a buffer.
      encoding: undefined,
      // If false, throw Errors.ITEM_NOT_FOUND.
      ignoreEntryNotFoundError: true,
      // SpineItem.
      spine: {
        // If true, extract body. Otherwise it returns a full string.
        // e.g. { body: '...', attrs: [{ name: 'style', value: 'background-color: #000000' }, ...] }
        extractBody: false,
        // If specified, transforms output of extractBody.
        extractAdapter: defaultExtractAdapter,
      },
      // CssItem or InlineCssItem.
      css: {
        // Remove at-rules.
        removeAtRule: false,
        // Remove the selector that point to html tag.
        removeHtml: false,
        // Remove the selector that point to body tag.
        removeBody: false,
        // Whether to minify when reading file.
        minify: false,
      },
    };
  }

  static get readOptionTypes() {
    return {
      encoding: 'string|undefined',
      ignoreEntryNotFoundError: 'boolean',
      spine: {
        extractBody: 'boolean',
        extractAdapter: 'function|undefined',
      },
      css: {
        removeAtRule: 'boolean',
        removeHtml: 'boolean',
        removeBody: 'boolean',
        minify: 'boolean',
      },
    };
  }

  get input() { return privateProps.get(this).input; }

  constructor(input) {
    if (isString(input)) {
      if (!fs.existsSync(input)) {
        throw Errors.PATH_NOT_FOUND;
      }
    } else if (!isExists(input) || !isBuffer(input)) {
      throw Errors.INVALID_INPUT;
    }
    privateProps.set(this, { input });
  }

  parse(options = {}) {
    return this._prepareParse(options)
      .then(context => this._validatePackageIfNeeded(context))
      .then(context => this._parseMetaInf(context))
      .then(context => this._parseOpf(context))
      .then(context => this._parseNcx(context))
      .then(context => this._unzipIfNeeded(context))
      .then(context => this._createBook(context))
      .then(book => book);
  }

  read(target, options = {}) {
    const items = isArray(target) ? target : [target];
    if (items.find(item => !(item instanceof Item))) {
      throw Errors.INVALID_ITEM;
    }

    const error = validateOptions(options, EpubParser.readDefaultOptions, EpubParser.readOptionTypes);
    if (isExists(error)) {
      throw error;
    }

    const readOptions = mergeObjects(EpubParser.readDefaultOptions, options);
    const { input } = this;
    let entries;
    if (isBuffer(input) || fs.lstatSync(input).isFile()) {
      entries = this._getEntries(new Zip(input));
    } else {
      entries = this._getEntries(input);
    }

    const results = items.map((item) => {
      if (item instanceof InlineCssItem) {
        return item.text;
      }

      const entry = findEntry(item.href, entries);
      if (!isExists(entry)) {
        if (options.ignoreEntryNotFoundError) {
          return undefined;
        }
        throw Errors.ITEM_NOT_FOUND;
      }

      const file = entry.getFile(readOptions.encoding);
      if (item instanceof SpineItem) {
        return spineLoader(item, file, readOptions.spine);
      }
      return file;
    });

    if (isArray(target)) {
      return results;
    }
    return results[0];
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
    return getPathes(input).reduce((entries, fullPath) => { // eslint-disable-line arrow-body-style
      return entries.concat([{
        entryName: fullPath.substring(input.length + path.sep.length),
        getFile: encoding => fs.readFileSync(fullPath, encoding),
        getSize: () => fs.lstatSync(fullPath).size,
      }]);
    }, []);
  }

  _prepareParse(options = {}) {
    return new Promise((resolve) => {
      const { input } = this;
      const context = new Context();
      const error = validateOptions(options, EpubParser.parseDefaultOptions, EpubParser.parseOptionTypes);
      if (isExists(error)) {
        throw error;
      } else if (isBuffer(input) || fs.lstatSync(input).isFile()) {
        const zip = new Zip(input);
        context.entries = this._getEntries(zip);
        context.zip = zip;
      } else {
        context.entries = this._getEntries(input);
      }
      context.options = mergeObjects(EpubParser.parseDefaultOptions, options);
      resolve(context);
    });
  }

  _validatePackageIfNeeded(context) {
    return new Promise((resolve) => {
      if (isExists(context.zip) && context.options.validatePackage) {
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

      const { container } = xmlLoader(containerEntry.getFile('utf8'), context.options);
      if (!isExists(container) || !isExists(container.rootfiles)) {
        throw Errors.META_INF_NOT_FOUND;
      }

      const { rootfiles } = container;
      // eslint-disable-next-line arrow-body-style
      const rootfile = (isArray(rootfiles) ? rootfiles : [rootfiles.rootfile]).find((item) => {
        return item['media-type'] === 'application/oebps-package+xml';
      });
      if (!isExists(rootfile)) {
        throw Errors.META_INF_NOT_FOUND;
      }

      const opfPath = rootfile['full-path'];
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

  _parseStyle(spineEntry, foundStyle) {
    const document = parse5.parse(spineEntry.getFile('utf8'));
    const html = document.childNodes.find(child => child.tagName === 'html');
    const head = html.childNodes.find(child => child.tagName === 'head');
    head.childNodes.filter(child => child.tagName === 'link').forEach((link) => {
      const { attrs } = link;
      if (isExists(attrs)) {
        const rel = attrs.find(property => property.name === 'rel');
        const type = attrs.find(property => property.name === 'type');
        if ((isExists(rel) && rel.value === 'stylesheet') || (isExists(type) && type.value === 'text/css')) {
          const href = attrs.find(property => property.name === 'href');
          if (isExists(href) && isExists(href.value) && !isUrl(href.value)) {
            foundStyle({ href: href.value });
          }
        }
      }
    });
    head.childNodes.filter(child => child.tagName === 'style').forEach((style) => {
      const firstNode = style.childNodes[0];
      if (isExists(firstNode)) {
        foundStyle({ text: firstNode.value || '' });
      }
    });
  }

  _parseOpf(context) {
    return new Promise((resolve) => {
      const { entries, options } = context;
      const opfEntry = findEntry(context.opfPath, entries);
      if (!isExists(opfEntry)) {
        throw Errors.OPF_NOT_FOUND;
      }

      const { package: root } = xmlLoader(opfEntry.getFile('utf8'), options);
      if (!isExists(root) || !isExists(root.metadata) || !isExists(root.manifest) || !isExists(root.spine)) {
        throw Errors.INVALID_OPF;
      }

      const { rawBook } = context;
      rawBook.epubVersion = parseFloat(root.version);

      const {
        title, creator, subject, description, publisher, contributor, date, type,
        format, identifier, source, language, relation, coverage, rights, meta,
      } = root.metadata;
      rawBook.titles = getValues(title);
      rawBook.creators = getValues(creator, key => (key === textNodeName ? 'name' : key));
      rawBook.subjects = getValues(subject);
      rawBook.description = description;
      rawBook.publisher = publisher;
      rawBook.contributors = getValues(contributor, key => (key === textNodeName ? 'name' : key));
      rawBook.dates = getValues(date, key => (key === textNodeName ? 'value' : key));
      rawBook.type = type;
      rawBook.format = format;
      rawBook.identifiers = getValues(identifier, key => (key === textNodeName ? 'value' : key));
      rawBook.source = source;
      rawBook.language = language;
      rawBook.relation = relation;
      rawBook.coverage = coverage;
      rawBook.rights = rights;
      rawBook.metas = getValues(meta);

      rawBook.items = [];
      const { toc: tocId } = root.spine;
      const itemrefs = getValues(root.spine.itemref);
      const inlineStyleItems = [];
      const coverMeta = rawBook.metas.find(item => item.name.toLowerCase() === 'cover');
      let foundCover = false;
      let spineIndex = 0;
      let cssIdx = 0;
      getValues(root.manifest.item).forEach((item) => {
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
          if (rawItem.itemType === SpineItem) {
            const ref = itemrefs.find(itemref => itemref.idref === rawItem.id);
            if (isExists(ref)) {
              rawItem.isLinear = isExists(ref.linear) ? ref.linear : true;
              if (options.ignoreLinear || rawItem.isLinear) {
                rawItem.spineIndex = spineIndex;
                spineIndex += 1;
              }
            } else {
              rawItem.itemType = DeadItem;
            }
          }
          if (options.useStyleNamespace) {
            if (rawItem.itemType === CssItem) {
              rawItem.namespace = `${options.styleNamespacePrefix}${cssIdx}`;
              cssIdx += 1;
            } else if (rawItem.itemType === SpineItem) {
              rawItem.styles = [];
              this._parseStyle(itemEntry, (style) => {
                if (isExists(style.href)) {
                  const basePath = removeLastPathComponent(rawItem.href);
                  rawItem.styles.push(safePathJoin(basePath, style.href));
                } else {
                  const namespace = `${options.styleNamespacePrefix}${cssIdx}`;
                  const href = `${rawItem.href}_${namespace}`;
                  rawItem.styles.push(href);
                  inlineStyleItems.push({
                    id: `${rawItem.id}_${namespace}`,
                    href,
                    mediaType: 'text/css',
                    size: style.text.length,
                    itemType: InlineCssItem,
                    namespace,
                    text: style.text,
                  });
                  cssIdx += 1;
                }
              });
            }
          } else if (rawItem.itemType === ImageItem) {
            if (!foundCover) {
              if (isExists(coverMeta) && rawItem.id === coverMeta.content) {
                rawItem.isCover = true;
                foundCover = true;
              } else if (rawItem.id.toLowerCase() === 'cover') {
                rawItem.isCover = true;
                foundCover = true;
              }
            }
          } else if (rawItem.itemType === NcxItem) {
            if (rawItem.id !== tocId) {
              rawItem.itemType = DeadItem;
            }
          }
        } else {
          rawItem.itemType = DeadItem;
        }

        rawBook.items.push(rawItem);
      });
      inlineStyleItems.forEach(inlineStyleItem => rawBook.items.push(inlineStyleItem));

      rawBook.guide = [];
      if (isExists(root.guide)) {
        getValues(root.guide.reference).forEach((reference) => {
          if (!foundCover && isExists(reference.type) && reference.type.toLowerCase() === Guide.Types.COVER) {
            const imageItem = rawBook.items.find(item => item.href === reference.href && item.itemType === ImageItem);
            if (isExists(imageItem)) {
              imageItem.isCover = true;
              foundCover = true;
            }
          }
          rawBook.guide.push(mergeObjects(reference, { href: safePathJoin(context.basePath, reference.href) }));
        });
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

        const { ncx } = xmlLoader(ncxEntry.getFile('utf8'), context.options);
        if (!isExists(ncx) || !isExists(ncx.navMap)) {
          throw Errors.INVALID_NCX;
        }

        ncxItem.navPoints = [];
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
        const keyTranslator = key => (key === 'navPoint' ? 'children' : key);
        getValues(ncx.navMap.navPoint, keyTranslator).forEach((navPoint) => { // eslint-disable-line arrow-body-style
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

export { defaultExtractAdapter };
