import { parse as parseHtml } from 'himalaya';
import fs from 'fs';
import path from 'path';

import Book from './model/Book';
import Context from './model/Context';
import CssItem from './model/CssItem';
import cssLoader from './loader/cssLoader';
import DeadItem from './model/DeadItem';
import Errors, { createError } from './constant/errors';
import FontItem from './model/FontItem';
import Guide from './model/Guide';
import ImageItem from './model/ImageItem';
import InlineCssItem from './model/InlineCssItem';
import Item from './model/Item';
import NcxItem from './model/NcxItem';
import SpineItem from './model/SpineItem';
import spineLoader from './loader/spineLoader';
import SvgItem from './model/SvgItem';
import xmlLoader, { getValues, textNodeName } from './loader/xmlLoader';

import {
  isArray,
  isExists,
  isString,
  isUrl,
  mergeObjects,
  validateOptions,
  createDirectory,
  removeDirectory,
  safePath,
  safeDirname,
  safePathJoin,
  getPathes,
  openZip,
} from './util';

const privateProps = new WeakMap();

const findEntry = (entryName, entries) => entries.find(entry => entry.entryName === entryName);

const defaultExtractAdapter = (body, attrs) => {
  let string = '';
  attrs.forEach((attr) => {
    string += ` ${attr.key}=\"${attr.value}\"`; // eslint-disable-line no-useless-escape
  });
  return {
    content: `<article${string}>${body}</article>`,
  };
};

class EpubParser {
  static get parseDefaultOptions() {
    return {
      // If true, validation package specifications in IDPF listed below.
      // - Zip header should not corrupt.
      // - mimetype file must be first file in archive.
      // - mimetype file should not compressed.
      // - mimetype file should only contain string 'application/epub+zip'.
      // - Shouldn't use extra field feature of ZIP format for mimetype file.
      validatePackage: false,
      // If true, stop parsing when XML parsing errors occur.
      validateXml: false,
      // If false, stop parsing when NCX file not exists.
      allowNcxFileMissing: true,
      // If specified, uncompress to that path. (Only if input is EPUB file.)
      unzipPath: undefined,
      // If true, creates intermediate directories for unzipPath.
      createIntermediateDirectories: true,
      // If true, removes a previous file from unzipPath.
      removePreviousFile: true,
      // If true, ignore spineIndex difference caused by isLinear property of SpineItem.
      // e.g. If left is false, right is true.
      //  [{ spineIndex: 0, isLinear: true, ... },       [{ spineIndex: 0, isLinear: true, ... },
      //   { spineIndex: 1, isLinear: true, ... },        { spineIndex: 1, isLinear: true, ... },
      //   { spineIndex: -1, isLinear: false, ... },      { spineIndex: 2, isLinear: false, ... },
      //   { spineIndex: 2, isLinear: true, ... }]        { spineIndex: 3, isLinear: true, ... }]
      ignoreLinear: true,
      // If true, One namespace is given per CSS file or inline style, and styles used for spine is described.
      // Otherwise it CssItem.namespace, SpineItem.styles is undefined.
      // In any list, InlineCssItem is always positioned after CssItem. (Book.styles, Book.items, SpineItem.styles, ...)
      useStyleNamespace: false,
      // Prepend given string to namespace for identification.
      styleNamespacePrefix: 'ridi_style',
    };
  }

  static get parseOptionTypes() {
    return {
      validatePackage: 'Boolean',
      validateXml: 'Boolean',
      allowNcxFileMissing: 'Boolean',
      unzipPath: 'String|Undefined',
      createIntermediateDirectories: 'Boolean',
      removePreviousFile: 'Boolean',
      ignoreLinear: 'Boolean',
      useStyleNamespace: 'Boolean',
      styleNamespacePrefix: 'String',
    };
  }

  static get readDefaultOptions() {
    return {
      // If specified, change base path of paths used by spine and css.
      // e.g. '../Images/cover.jpg' -> '{basePath}/OEBPS/Images/cover.jpg'
      basePath: undefined,
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
        removeAtrules: ['charset', 'import', 'keyframes', 'media', 'namespace', 'supports'],
        // Remove selector that point to specified tags.
        removeTags: [],
        // Remove selector that point to specified ids.
        removeIds: [],
        // Remove selector that point to specified classes.
        removeClasses: [],
      },
    };
  }

  static get readOptionTypes() {
    return {
      basePath: 'String|Undefined',
      spine: {
        extractBody: 'Boolean',
        extractAdapter: 'Function|Undefined',
      },
      css: {
        removeAtrules: 'Array',
        removeTags: 'Array',
        removeIds: 'Array',
        removeClasses: 'Array',
      },
    };
  }

  get input() { return privateProps.get(this).input; }

  constructor(input) {
    if (isString(input)) {
      if (!fs.existsSync(input)) {
        throw createError(Errors.ENOENT, input);
      }
    } else {
      throw createError(Errors.EINVAL, 'input', 'input', input);
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

  read(targetItem, options = {}) {
    return this._prepareRead(targetItem, options)
      .then((context) => { // eslint-disable-line arrow-body-style
        return new Promise((resolve) => {
          const {
            targetItems, readOptions, entries, zip,
          } = context;
          const results = targetItems.map((item) => {
            if (item instanceof InlineCssItem) {
              return cssLoader(item, item.text, readOptions);
            }

            const entry = findEntry(item.href, entries);
            if (!isExists(entry)) {
              throw createError(Errors.ENOFILE, item.href);
            }

            const file = entry.getFile(this._getEncoding(item));
            if (item instanceof SpineItem) {
              return spineLoader(item, file, readOptions);
            }
            if (item instanceof CssItem) {
              return cssLoader(item, file, readOptions);
            }
            return file;
          });

          if (isExists(zip)) {
            zip.close();
          }

          if (isArray(targetItem)) {
            resolve(results);
          } else {
            resolve(results[0]);
          }
        });
      }).catch((err) => {
        throw err;
      });
  }

  _getEntries(input) {
    if (!isString(input)) {
      return Object.values(input.entries()).reduce((entries, entry) => { // eslint-disable-line arrow-body-style
        return entries.concat([{
          entryName: entry.name,
          getFile: (encoding) => {
            if (isExists(encoding)) {
              return input.entryDataSync(entry).toString(encoding);
            }
            return input.entryDataSync(entry);
          },
          getSize: () => entry.size,
          method: entry.method,
          extraLength: entry.extraLen,
        }]);
      }, []);
    }
    return getPathes(input).reduce((entries, fullPath) => {
      const subPathOffset = path.normalize(input).length + path.sep.length;
      return entries.concat([{
        entryName: safePath(fullPath).substring(subPathOffset),
        getFile: encoding => fs.readFileSync(fullPath, encoding),
        getSize: () => fs.lstatSync(fullPath).size,
      }]);
    }, []);
  }

  _getEncoding(item) {
    switch (item.constructor.name) {
      case CssItem.name:
      case InlineCssItem.name:
      case NcxItem.name:
      case SpineItem.name:
      case SvgItem.name:
        return 'utf8';
      default:
        return undefined; // Buffer
    }
  }

  _prepareParse(options = {}) {
    return new Promise((resolve) => {
      const { input } = this;
      const context = new Context();

      validateOptions(options, EpubParser.parseDefaultOptions, EpubParser.parseOptionTypes);
      context.options = mergeObjects(EpubParser.parseDefaultOptions, options);

      if (fs.lstatSync(input).isFile()) {
        openZip(input).then((zip) => {
          context.entries = this._getEntries(zip);
          context.zip = zip;
          resolve(context);
        }).catch((err) => {
          throw err;
        });
      } else {
        context.entries = this._getEntries(input);
        resolve(context);
      }
    });
  }

  _prepareRead(targetItem, options = {}) {
    return new Promise((resolve, reject) => {
      const targetItems = isArray(targetItem) ? targetItem : [targetItem];
      if (targetItems.find(item => !(item instanceof Item))) {
        throw createError(Errors.EINVAL, 'item', 'reason', 'item must be Item type');
      }

      validateOptions(options, EpubParser.readDefaultOptions, EpubParser.readOptionTypes);

      const readOptions = mergeObjects(EpubParser.readDefaultOptions, options);
      const { input } = this;
      if (fs.lstatSync(input).isFile()) {
        openZip(input).then((zip) => {
          const entries = this._getEntries(zip);
          resolve({
            targetItems, readOptions, entries, zip,
          });
        }).catch((err) => {
          reject(err);
        });
      } else {
        const entries = this._getEntries(input);
        resolve({ targetItems, readOptions, entries });
      }
    });
  }

  _validatePackageIfNeeded(context) {
    return new Promise((resolve) => {
      if (isExists(context.zip) && context.options.validatePackage) {
        const firstEntry = context.entries[0];
        if (firstEntry.entryName !== 'mimetype') {
          throw createError(Errors.EINVAL, 'package', 'reason', 'mimetype file must be first file in archive.');
        } else if (firstEntry.method !== 0 /* STORED */) {
          throw createError(Errors.EINVAL, 'package', 'reason', 'mimetype file should not compressed.');
        } else if (firstEntry.getFile('utf8') !== 'application/epub+zip') {
          const reason = 'mimetype file should only contain string \'application/epub+zip\'.';
          throw createError(Errors.EINVAL, 'package', 'reason', reason);
        } else if (firstEntry.extraLength > 0) {
          const reason = 'shouldn\'t use extra field feature of ZIP format for mimetype file.';
          throw createError(Errors.EINVAL, 'package', 'reason', reason);
        }
      }
      resolve(context);
    });
  }

  _parseMetaInf(context) {
    return new Promise((resolve) => {
      const entryName = 'META-INF/container.xml';
      const containerEntry = findEntry(entryName, context.entries);
      if (!isExists(containerEntry)) {
        throw createError(Errors.ENOFILE, entryName);
      }

      const { container } = xmlLoader(containerEntry, context.options);
      if (!isExists(container)) {
        throw createError(Errors.ENOELMT, 'container', entryName);
      }

      if (!isExists(container.rootfiles)) {
        throw createError(Errors.ENOELMT, 'rootfiles', entryName);
      }

      const { rootfiles } = container;
      // eslint-disable-next-line arrow-body-style
      const rootfile = (isArray(rootfiles) ? rootfiles : [rootfiles.rootfile]).find((item) => {
        return item['media-type'] === 'application/oebps-package+xml';
      });
      if (!isExists(rootfile)) {
        throw createError(Errors.ENOELMT, 'rootfile', entryName);
      }

      const opfPath = rootfile['full-path'];
      if (!isExists(opfPath)) {
        throw createError(Errors.ENOATTR, 'rootfile', 'full-path', entryName);
      }

      context.opfPath = safePath(opfPath);
      context.basePath = safeDirname(opfPath);

      resolve(context);
    });
  }

  _getItemType(mediaType) {
    // See: http://www.idpf.org/epub/20/spec/OPS_2.0.1_draft.htm#Section1.3.7
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
      'image/svg+xml': SvgItem,
      'text/css': CssItem,
    };
    const type = types[mediaType.toLowerCase()];
    if (!isExists(type)) {
      return DeadItem;
    }
    return type;
  }

  _parseStyle(spineEntry, foundStyle) {
    const document = parseHtml(spineEntry.getFile('utf8'));
    const html = document.find(child => child.tagName === 'html');
    const head = html.children.find(child => child.tagName === 'head');
    head.children.filter(child => child.tagName === 'link').forEach((link) => {
      const { attributes: attrs } = link;
      if (isExists(attrs)) {
        const rel = attrs.find(property => property.key === 'rel');
        const type = attrs.find(property => property.key === 'type');
        if ((isExists(rel) && rel.value === 'stylesheet') || (isExists(type) && type.value === 'text/css')) {
          const href = attrs.find(property => property.key === 'href');
          if (isExists(href) && isExists(href.value) && !isUrl(href.value)) {
            foundStyle({ href: href.value });
          }
        }
      }
    });
    head.children.filter(child => child.tagName === 'style').forEach((style) => {
      const firstNode = style.children[0];
      if (isExists(firstNode)) {
        foundStyle({ text: firstNode.content || '' });
      }
    });
  }

  _parseOpf(context) {
    return new Promise((resolve) => {
      const { entries, options, opfPath } = context;
      const opfEntry = findEntry(opfPath, entries);
      if (!isExists(opfEntry)) {
        throw createError(Errors.ENOFILE, opfPath);
      }

      const { package: root } = xmlLoader(opfEntry, options);
      if (!isExists(root)) {
        throw createError(Errors.ENOELMT, 'package', opfPath);
      }

      if (!isExists(root.metadata) || !isExists(root.manifest) || !isExists(root.spine)) {
        throw createError(Errors.ENOELMT, 'metadata or manifest or spine', opfPath);
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
          rawItem.href = safePath(item.href);
        }
        rawItem.mediaType = item['media-type'];
        rawItem.itemType = this._getItemType(rawItem.mediaType);
        if (rawItem.itemType === DeadItem) {
          rawItem.reason = DeadItem.Reason.NOT_SUPPORT_TYPE;
        }

        const itemEntry = findEntry(rawItem.href, context.entries);
        if (isExists(itemEntry)) {
          rawItem.size = itemEntry.getSize();
          if (rawItem.itemType === SpineItem) {
            const ref = itemrefs.find(itemref => itemref.idref === rawItem.id);
            if (isExists(ref)) {
              rawItem.isLinear = isExists(ref.linear) ? JSON.parse(ref.linear) : true;
              if (options.ignoreLinear || rawItem.isLinear) {
                rawItem.spineIndex = spineIndex;
                spineIndex += 1;
              }
            } else {
              rawItem.itemType = DeadItem;
              rawItem.reason = DeadItem.Reason.NOT_SPINE;
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
                  rawItem.styles.push(safePathJoin(safeDirname(rawItem.href), style.href));
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
              rawItem.reason = DeadItem.Reason.NOT_NCX;
            }
          }
        } else {
          rawItem.itemType = DeadItem;
          rawItem.reason = DeadItem.Reason.NOT_EXISTS;
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
          throw createError(Errors.ENOFILE, ncxItem.href);
        }

        const { ncx } = xmlLoader(ncxEntry, context.options);
        if (!isExists(ncx)) {
          throw createError(Errors.ENOELMT, 'ncx', ncxItem.href);
        }

        if (!isExists(ncx.navMap)) {
          throw createError(Errors.ENOELMT, 'navMap', ncxItem.href);
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
      }
      resolve(context);
    });
  }

  _unzipIfNeeded(context) {
    return new Promise((resolve, reject) => {
      const { options, zip } = context;
      const { unzipPath, removePreviousFile, createIntermediateDirectories } = options;

      if (!isExists(zip)) {
        resolve(context);
        return;
      }

      if (isExists(unzipPath)) {
        if (removePreviousFile) {
          removeDirectory(unzipPath);
        }
        if (createIntermediateDirectories) {
          createDirectory(unzipPath);
        }
        zip.extract(null, unzipPath, (err) => {
          zip.close();
          if (isExists(err)) {
            reject(err);
          } else {
            resolve(context);
          }
        });
      } else {
        zip.close();
        resolve(context);
      }
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
