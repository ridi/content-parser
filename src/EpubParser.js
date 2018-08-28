import { parse as parseHtml } from 'himalaya';
import fs from 'fs';

import Book from './model/Book';
import Context from './model/Context';
import CssItem from './model/CssItem';
import cssLoader from './loader/cssLoader';
import DeadItem from './model/DeadItem';
import Errors, { createError } from './constant/errors';
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
  isExists,
  isString,
  isUrl,
  mergeObjects,
  validateOptions,
  getItemEncoding,
  getItemType,
  createDirectory,
  removeDirectory,
  safePath,
  safeDirname,
  safePathJoin,
  readEntries,
  findEntry,
  extractAll,
} from './util';

const privateProps = new WeakMap();

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

  _prepareParse(options = {}) {
    return new Promise((resolve, reject) => {
      validateOptions(options, EpubParser.parseDefaultOptions, EpubParser.parseOptionTypes);

      const context = new Context();
      context.options = mergeObjects(EpubParser.parseDefaultOptions, options);
      readEntries(this.input).then((result) => {
        context.entries = result.entries;
        if (isExists(result.zip)) {
          context.zip = result.zip;
        }
        resolve(context);
      }).catch(err => reject(err));
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
      const containerEntry = findEntry(context.entries, entryName);
      if (!isExists(containerEntry)) {
        throw createError(Errors.ENOFILE, entryName);
      }

      // container.xml
      // <?xml ... ?>
      // <container ...>
      //   <rootfiles>
      //     <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
      //     ...                  ^~~~~~~~~~~~~~~~~
      //   </rootfiles>
      // </container>
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

  _parseOpf(context) {
    return new Promise((resolve) => {
      const { entries, options, opfPath } = context;
      const opfEntry = findEntry(entries, opfPath);
      if (!isExists(opfEntry)) {
        throw createError(Errors.ENOFILE, opfPath);
      }

      // content.opf
      // <?xml ... ?>
      // <package version="2.0" ...>
      //                   ^~~
      //   <metadata ...>...</metadata>
      //    ^~~~~~~~~~~~~~~~~~~~~~~~~~
      //   <manifest>...</manifest>
      //    ^~~~~~~~~~~~~~~~~~~~~~
      //   <spine toc="...">...</spine>
      //    ^~~~~~~~~~~~~~~~~~~~~~~~~~
      //   <guide>...</guide>
      //    ^~~~~~~~~~~~~~~~
      // </package>
      const { package: root } = xmlLoader(opfEntry, options);
      if (!isExists(root)) {
        throw createError(Errors.ENOELMT, 'package', opfPath);
      }

      if (!isExists(root.metadata) || !isExists(root.manifest) || !isExists(root.spine)) {
        throw createError(Errors.ENOELMT, 'metadata or manifest or spine', opfPath);
      }

      context.rawBook.epubVersion = parseFloat(root.version);
      this._parseMetadata(root.metadata, context)
        .then(ctx => this._parseManifestWithSpine(root.manifest, root.spine, ctx))
        .then(ctx => this._parseGuide(root.guide, ctx))
        .then(ctx => resolve(ctx));
    });
  }

  _parseMetadata(metadata, context) {
    return new Promise((resolve) => {
      const { rawBook } = context;
      const {
        title, creator, subject, description, publisher, contributor, date, type,
        format, identifier, source, language, relation, coverage, rights, meta,
      } = metadata;
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
      resolve(context);
    });
  }

  _parseManifestWithSpine(manifest, spine, context) {
    return new Promise((resolve) => {
      const { rawBook, basePath, options } = context;
      const { toc: tocId } = spine;
      const items = getValues(manifest.item);
      const itemrefs = getValues(spine.itemref);
      const coverMeta = rawBook.metas.find(item => item.name.toLowerCase() === 'cover');
      let foundCover = false;
      let spineIndex = 0;
      let inlineStyles = [];
      let cssIdx = 0;

      rawBook.items = [];
      for (const item of items) { // eslint-disable-line no-restricted-syntax
        const rawItem = {};
        rawItem.id = item.id;
        if (isExists(item.href)) {
          // ../Text/Section0001.xhtml => {basePath}/Text/Section0001.xhtml
          rawItem.href = safePathJoin(basePath, item.href);
        }
        rawItem.mediaType = item['media-type'];
        rawItem.itemType = getItemType(rawItem.mediaType);
        if (rawItem.itemType === DeadItem) {
          rawItem.reason = DeadItem.Reason.NOT_SUPPORT_TYPE;
        }

        const itemEntry = findEntry(context.entries, rawItem.href);
        if (isExists(itemEntry)) {
          rawItem.size = itemEntry.getSize();

          if (rawItem.itemType === SpineItem) {
            // Checks if item is referenced in spine list.
            const ref = itemrefs.find(itemref => itemref.idref === rawItem.id);
            if (isExists(ref)) {
              // If isLinear is false, then spineIndex is not assigned.
              // Because this spine is excluded from flow.
              rawItem.isLinear = isExists(ref.linear) ? JSON.parse(ref.linear) : true;
              if (options.ignoreLinear || rawItem.isLinear) {
                rawItem.spineIndex = spineIndex;
                spineIndex += 1;
              }
            } else {
              rawItem.itemType = DeadItem;
              rawItem.reason = DeadItem.Reason.NOT_SPINE;
            }
          } else if (rawItem.itemType === ImageItem) {
            if (!foundCover) {
              // EPUB2 spec doesn't have cover image declaration, it founding for cover image in order listed below.
              // 1. metadata.meta[name="cover"].content === imageItem.id
              // 2. imageItem.id === 'cover'
              // 3. guide.reference[type="cover"].href === imageItem.href (see _parseGuide)
              if (isExists(coverMeta) && rawItem.id === coverMeta.content) {
                rawItem.isCover = true;
                foundCover = true;
              } else if (rawItem.id.toLowerCase() === 'cover') {
                rawItem.isCover = true;
                foundCover = true;
              }
            }
          } else if (rawItem.itemType === NcxItem) {
            // NCX is valid only if rawItem.id matches tocId.
            if (rawItem.id !== tocId) {
              rawItem.itemType = DeadItem;
              rawItem.reason = DeadItem.Reason.NOT_NCX;
            }
          }

          if (options.useStyleNamespace) {
            if (rawItem.itemType === CssItem) {
              rawItem.namespace = `${options.styleNamespacePrefix}${cssIdx}`;
              cssIdx += 1;
            } else if (rawItem.itemType === SpineItem) {
              const result = this._parseSpineStyle(rawItem, itemEntry.getFile('utf8'), cssIdx, options);
              rawItem.styles = result.styles;
              inlineStyles = inlineStyles.concat(result.inlineStyles);
              cssIdx = result.cssIdx; // eslint-disable-line
            }
          }
        } else {
          rawItem.itemType = DeadItem;
          rawItem.reason = DeadItem.Reason.NOT_EXISTS;
        }
        rawBook.items.push(rawItem);
      }
      inlineStyles.forEach(inlineStyle => rawBook.items.push(inlineStyle));
      context.foundCover = foundCover;
      resolve(context);
    });
  }

  _parseSpineStyle(rawItem, file, cssIdx, options) {
    const styles = [];
    const inlineStyles = [];
    const document = parseHtml(file);
    const html = document.find(child => child.tagName === 'html');
    const head = html.children.find(child => child.tagName === 'head');

    // <link rel="stylesheet" type="text/css" href="..." ... />
    //                                              ^~~
    head.children.filter(child => child.tagName === 'link').forEach((link) => {
      const { attributes: attrs } = link;
      if (isExists(attrs)) {
        const rel = attrs.find(property => property.key === 'rel');
        const type = attrs.find(property => property.key === 'type');
        if ((isExists(rel) && rel.value === 'stylesheet') || (isExists(type) && type.value === 'text/css')) {
          const href = attrs.find(property => property.key === 'href');
          if (isExists(href) && isExists(href.value) && !isUrl(href.value)) {
            styles.push(safePathJoin(safeDirname(rawItem.href), href.value));
          }
        }
      }
    });

    // <style ...>...</style>
    //            ^~~
    head.children.filter(child => child.tagName === 'style').forEach((style) => {
      const firstNode = style.children[0];
      if (isExists(firstNode)) {
        const namespace = `${options.styleNamespacePrefix}${cssIdx}`;
        const href = `${rawItem.href}_${namespace}`;
        const text = firstNode.content || '';
        styles.push(href);
        inlineStyles.push({
          id: `${rawItem.id}_${namespace}`,
          href,
          mediaType: 'text/css',
          size: text.length,
          itemType: InlineCssItem,
          namespace,
          text,
        });
        cssIdx += 1;
      }
    });

    return { styles, inlineStyles, cssIdx };
  }

  _parseGuide(guide, context) {
    return new Promise((resolve) => {
      const { rawBook } = context;
      let { foundCover } = context;

      rawBook.guide = [];
      if (isExists(guide)) {
        getValues(guide.reference).forEach((reference) => {
          // If reference.type is 'cover' and there is an image item matching reference.href, it is cover image.
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
      const { rawBook, entries, options } = context;
      const { allowNcxFileMissing } = options;
      const ncxItem = rawBook.items.find(item => item.itemType === NcxItem);
      if (isExists(ncxItem)) {
        const ncxEntry = findEntry(entries, ncxItem.href);
        if (!allowNcxFileMissing && !isExists(ncxEntry)) {
          throw createError(Errors.ENOFILE, ncxItem.href);
        }

        // toc.ncx
        // <?xml ... ?>
        // <!DOCTYPE ncx ... >
        // <ncx ... >
        //   ...
        //   <navMap>
        //     <navPoint id="..." playOrder="...">
        //       <navLabel><text>...</text></navLabel>
        //       <content src="..." />
        //       {<navPoint>...</navPoint>}
        //     </navPoint>
        //     ...
        //   </navMap>
        //   ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //   ...
        // </ncx>
        const { ncx } = xmlLoader(ncxEntry, options);
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
            // Text/Section0001.xhtml => {basePath}/Text/Section0001.xhtml
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

      if (!isExists(zip) || !isExists(unzipPath)) {
        if (isExists(zip)) {
          zip.close();
        }
        resolve(context);
      } else {
        if (removePreviousFile) {
          removeDirectory(unzipPath);
        }
        if (createIntermediateDirectories) {
          createDirectory(unzipPath);
        }
        extractAll(zip, unzipPath, true)
          .then(() => resolve(context))
          .catch(err => reject(err));
      }
    });
  }

  _createBook(context) {
    return new Promise((resolve) => {
      resolve(new Book(context.rawBook));
    });
  }

  read(target, options = {}) {
    return this._prepareRead(target, options)
      .then(context => this._read(context))
      .catch((err) => {
        throw err;
      });
  }

  _prepareRead(target, options = {}) {
    return new Promise((resolve, reject) => {
      const targetItems = isArray(target) ? target : [target];
      if (targetItems.find(item => !(item instanceof Item))) {
        throw createError(Errors.EINVAL, 'item', 'reason', 'item must be Item type');
      }

      validateOptions(options, EpubParser.readDefaultOptions, EpubParser.readOptionTypes);

      readEntries(this.input).then((result) => {
        resolve({
          targetItems,
          options: mergeObjects(EpubParser.readDefaultOptions, options),
          entries: result.entries,
          zip: result.zip,
        });
      }).catch(err => reject(err));
    });
  }

  _read(context) {
    return new Promise((resolve) => {
      const { targetItems, options, entries } = context;
      const results = targetItems.map((item) => {
        if (item instanceof InlineCssItem) {
          return cssLoader(item, item.text, options);
        }

        const entry = findEntry(entries, item.href);
        if (!isExists(entry)) {
          throw createError(Errors.ENOFILE, item.href);
        }

        const file = entry.getFile(getItemEncoding(item));
        if (item instanceof SpineItem) {
          return spineLoader(item, file, options);
        }
        if (item instanceof CssItem) {
          return cssLoader(item, file, options);
        }
        return file;
      });

      const { zip } = context;
      if (isExists(zip)) {
        zip.close();
      }

      if (results.length > 1) {
        resolve(results);
      } else {
        resolve(results[0]);
      }
    });
  }
}

export default EpubParser;

export { defaultExtractAdapter };
