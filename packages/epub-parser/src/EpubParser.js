import {
  Errors, createError,
  Logger,
  isArray, isExists, isString, isUrl,
  mergeObjects,
  parseBool,
  readEntries,
  safeDirname, safePath, safePathJoin,
  validateOptions,
} from '@ridi/parser-core';

import { parse as parseHtml } from 'himalaya';
import fs from 'fs';

import Book from './model/Book';
import Context from './model/Context';
import CssItem from './model/CssItem';
import cssLoader from './loader/cssLoader';
import DeadItem from './model/DeadItem';
import FontItem from './model/FontItem';
import Guide from './model/Guide';
import ImageItem from './model/ImageItem';
import InlineCssItem from './model/InlineCssItem';
import Item from './model/Item';
import NcxItem from './model/NcxItem';
import SpineItem from './model/SpineItem';
import spineLoader from './loader/spineLoader';
import SvgItem from './model/SvgItem';
import xmlLoader, { getValue, getValues, textNodeName } from './loader/xmlLoader';

const privateProps = new WeakMap();

class EpubParser {
  /**
   * Get default values of parse options
   */
  static get parseDefaultOptions() {
    return {
      // If true, validation package specifications in IDPF listed below. (only using if input is EPUB file.)
      // - Zip header should not corrupt.
      // - mimetype file must be first file in archive.
      // - mimetype file should not compressed.
      // - mimetype file should only contain string 'application/epub+zip'.
      // - Shouldn't use extra field feature of ZIP format for mimetype file.
      validatePackage: false,
      // If false, stop parsing when NCX file not exists.
      allowNcxFileMissing: true,
      // If specified, uncompress to that path. (only using if input is EPUB file.)
      unzipPath: undefined,
      // If true, overwrite to unzipPath when uncompress. (only using if unzipPath specified.)
      overwrite: true,
      // If true, ignore index difference caused by isLinear property of SpineItem.
      // e.g. If left is true, right is false.
      //  [{ index: 0, isLinear: true, ... },       [{ index: 0, isLinear: true, ... },
      //   { index: 1, isLinear: true, ... },        { index: 1, isLinear: true, ... },
      //   { index: 2, isLinear: false, ... },       { index: -1, isLinear: false, ... },
      //   { index: 3, isLinear: true, ... }]        { index: 2, isLinear: true, ... }]
      ignoreLinear: false,
      // If true, styles used for spine is described, and one namespace is given per CSS file or inline style.
      // Otherwise it CssItem.namespace, SpineItem.styles is undefined.
      // In any list, InlineCssItem is always positioned after CssItem. (Book.styles, Book.items, SpineItem.styles, ...)
      parseStyle: true,
      // Prepend given string to namespace for identification. (only using if parseStyle is true.)
      styleNamespacePrefix: 'ridi_style',
    };
  }

  /**
   * Get types of parse options
   */
  static get parseOptionTypes() {
    return {
      validatePackage: 'Boolean',
      allowNcxFileMissing: 'Boolean',
      unzipPath: 'String|Undefined',
      overwrite: 'Boolean',
      ignoreLinear: 'Boolean',
      parseStyle: 'Boolean',
      styleNamespacePrefix: 'String',
    };
  }

  /**
   * Get default values of read options
   */
  static get readDefaultOptions() {
    return {
      // If specified, change base path of paths used by spine and css.
      // e.g. '../Images/cover.jpg' -> '{basePath}/OEBPS/Images/cover.jpg'
      basePath: undefined,
      // If true, extract body. Otherwise it returns a full string.
      // If specify a function instead of true, use function to transform body.
      // e.g. extractBody: (innerHTML, attrs) => `<body>${innerHTML}</body>`
      extractBody: false,
      // If true, replace file path of anchor in spine with spine index.
      serializedAnchor: false,
      // Remove at-rules.
      removeAtrules: [],
      // Remove selector that point to specified tags.
      removeTags: [],
      // Remove selector that point to specified ids.
      removeIds: [],
      // Remove selector that point to specified classes.
      removeClasses: [],
    };
  }

  /**
   * Get types of read option
   */
  static get readOptionTypes() {
    return {
      basePath: 'String|Undefined',
      extractBody: 'Boolean|Function',
      serializedAnchor: 'Boolean',
      removeAtrules: 'Array',
      removeTags: 'Array',
      removeIds: 'Array',
      removeClasses: 'Array',
    };
  }

  /**
   * Get file or directory
   */
  get input() { return privateProps.get(this).input; }

  /**
   * Get en/decrypto provider
   */
  get cryptoProvider() { return privateProps.get(this).cryptoProvider; }

  /**
   * Create new EpubParser
   * @param {string} input file or directory
   * @param {CryptoProvider} cryptoProvider en/decrypto provider
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.EINVAL} invalid input
   * @example new EpubParser('./foo/bar.epub' or './foo/bar');
   */
  constructor(input, cryptoProvider) {
    if (isString(input)) {
      if (!fs.existsSync(input)) {
        throw createError(Errors.ENOENT, input);
      }
    } else {
      throw createError(Errors.EINVAL, 'input', 'input', input);
    }
    privateProps.set(this, { input, cryptoProvider });
  }

  /**
   * EPUB Parsing
   * @param {?object} options parse options
   * @returns {Promise.<Book>} return Book
   * @see EpubParser.parseDefaultOptions
   * @see EpubParser.parseOptionTypes
   * @example
   * const options = { validatePackage: true, unzipPath: './foo/bar' };
   * parser.parse(options).then((book) => {
   *   ...
   * });
   */
  async parse(options = {}) {
    let context = await this._prepareParse(options);
    context = await this._validatePackageIfNeeded(context);
    context = await this._parseMetaInf(context);
    context = await this._parseOpf(context);
    context = await this._parseNcx(context);
    context = await this._unzipIfNeeded(context);
    Logger.warn('Cover image not found in EPUB.');
    const book = await this._createBook(context);
    return book;
  }

  /**
   * Validate parse options and get entries from input
   * @param {?object} options parse options
   * @returns {Promise.<Context>} return Context containing parse options, entries
   * @throws {Errors.EINVAL} invalid options or value type
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.ENOFILE} no such file
   * @see EpubParser.parseDefaultOptions
   * @see EpubParser.parseOptionTypes
   */
  async _prepareParse(options = {}) {
    validateOptions(options, EpubParser.parseOptionTypes);
    const context = new Context();
    context.options = mergeObjects(EpubParser.parseDefaultOptions, options);
    context.entries = await readEntries(this.input, this.cryptoProvider);
    return context;
  }

  /**
   * Validate package spec if zip source and validatePackage option specified
   * @param {Context} context intermediate result
   * @returns {Promise.<Context>} return Context (no change at this step)
   * @throws {Errors.EINVAL} invalid package
   * @see EpubParser.parseDefaultOptions.validatePackage
   */
  async _validatePackageIfNeeded(context) {
    const { entries, options } = context;
    if (!isString(entries.source) && options.validatePackage) {
      const firstEntry = context.entries.first; // TODO: If no first one
      const signature = await firstEntry.getFile('utf8');
      if (firstEntry.entryPath !== 'mimetype') {
        throw createError(Errors.EINVAL, 'package', 'reason', 'mimetype file must be first file in archive.');
      } else if (firstEntry.method !== 0 /* STORED */) {
        throw createError(Errors.EINVAL, 'package', 'reason', 'mimetype file should not compressed.');
      } else if (signature !== 'application/epub+zip') {
        const reason = 'mimetype file should only contain string \'application/epub+zip\'.';
        throw createError(Errors.EINVAL, 'package', 'reason', reason);
      } else if (firstEntry.extraFieldLength > 0) {
        const reason = 'shouldn\'t use extra field feature of ZIP format for mimetype file.';
        throw createError(Errors.EINVAL, 'package', 'reason', reason);
      }
    }
    return context;
  }

  /**
   * Locate OPF and base path in container.xml
   * @param {Context} context intermediate result
   * @return {Promise.<Context>} return Context containing OPF and base path
   * @throws {Errors.ENOFILE} container.xml not found
   * @throws {Errors.EINVAL} invalid XML
   * @throws {Errors.ENOELMT} no such element in container.xml
   * @throws {Errors.ENOATTR} no such attribute in element
   */
  async _parseMetaInf(context) {
    const entryPath = 'META-INF/container.xml';
    const containerEntry = context.entries.find(entryPath);
    if (!isExists(containerEntry)) {
      throw createError(Errors.ENOFILE, entryPath);
    }

    // container.xml
    // <?xml ... ?>
    // <container ...>
    //   <rootfiles>
    //     <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    //     ...                  ^~~~~~~~~~~~~~~~~
    //   </rootfiles>
    // </container>
    const { container } = xmlLoader(await containerEntry.getFile('utf8'));
    if (!isExists(container)) {
      throw createError(Errors.ENOELMT, 'container', entryPath);
    }

    if (!isExists(container.rootfiles)) {
      throw createError(Errors.ENOELMT, 'rootfiles', entryPath);
    }

    const { rootfiles } = container;
    // eslint-disable-next-line arrow-body-style
    const rootfile = (isArray(rootfiles) ? rootfiles : [rootfiles.rootfile]).find((item) => {
      return item['media-type'] === 'application/oebps-package+xml';
    });
    if (!isExists(rootfile)) {
      throw createError(Errors.ENOELMT, 'rootfile', entryPath);
    }

    const opfPath = rootfile['full-path'];
    if (!isExists(opfPath)) {
      throw createError(Errors.ENOATTR, 'rootfile', 'full-path', entryPath);
    }

    context.opfPath = safePath(opfPath);
    context.basePath = safeDirname(opfPath);

    return context;
  }

  /**
   * OPF parsing
   * @param {Context} context intermediate result
   * @returns {Promise.<Context>} return Context containing OPF parsing result
   * @throws {Errors.EINVAL} invalid xml
   * @throws {Errors.ENOFILE} OPF not found
   * @throws {Errors.ENOELMT} no such element in OPF
   */
  async _parseOpf(context) {
    const { entries, opfPath } = context;
    const opfEntry = entries.find(opfPath);
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
    const { package: root } = xmlLoader(await opfEntry.getFile('utf8'));
    if (!isExists(root)) {
      throw createError(Errors.ENOELMT, 'package', opfPath);
    }

    if (!isExists(root.metadata) || !isExists(root.manifest) || !isExists(root.spine)) {
      throw createError(Errors.ENOELMT, 'metadata or manifest or spine', opfPath);
    }

    context.rawBook.version = root.version;
    context = await this._parseMetadata(root.metadata, context);
    context = await this._parseManifestAndSpine(root.manifest, root.spine, context);
    context = await this._parseGuide(root.guide, context);

    return context;
  }

  /**
   * Metadata parsing in OPF
   * @param {object} metadata metadata AST
   * @param {Context} context intermediate result
   * @returns {Promise.<Context>} return Context containing metadata
   */
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
      rawBook.description = getValue(description);
      rawBook.publisher = getValue(publisher);
      rawBook.contributors = getValues(contributor, key => (key === textNodeName ? 'name' : key));
      rawBook.dates = getValues(date, key => (key === textNodeName ? 'value' : key));
      rawBook.type = getValue(type);
      rawBook.format = getValue(format);
      rawBook.identifiers = getValues(identifier, key => (key === textNodeName ? 'value' : key));
      rawBook.source = getValue(source);
      rawBook.language = getValue(language);
      rawBook.relation = getValue(relation);
      rawBook.coverage = getValue(coverage);
      rawBook.rights = getValue(rights);
      rawBook.metas = getValues(meta);
      resolve(context);
    });
  }

  /**
   * Manifest and spine parsing in OPF
   * @param {object} manifest manifest AST
   * @param {object} spine spine AST
   * @param {Context} context intermediate result
   * @returns {Promise.<Context>} return Context containing manifest and spine
   * @see EpubParser.parseDefaultOptions.parseStyle
   * @see EpubParser.parseDefaultOptions.styleNamespacePrefix
   */
  async _parseManifestAndSpine(manifest, spine, context) {
    const {
      rawBook, basePath, options, entries,
    } = context;
    const { toc: tocId } = spine;
    const items = getValues(manifest.item);
    const itemRefs = getValues(spine.itemref);
    const coverMeta = rawBook.metas.find(item => item.name.toLowerCase() === 'cover');
    let inlineStyles = [];

    rawBook.items = [];
    await items.reduce((prevPromise, item, idx) => { // eslint-disable-line arrow-body-style
      return prevPromise.then(async () => {
        const rawItem = {};
        rawItem.id = item.id;
        if (isExists(item.href)) {
          // ../Text/Section0001.xhtml => {basePath}/Text/Section0001.xhtml
          rawItem.href = safePathJoin(basePath, item.href);
        }
        rawItem.mediaType = item['media-type'];
        rawItem.itemType = this.getItemTypeFromMediaType(rawItem.mediaType);
        if (rawItem.itemType === DeadItem) {
          rawItem.reason = DeadItem.Reason.NOT_SUPPORT_TYPE;
          Logger.warn(`Referenced resource '${rawItem.id}' ignored. (reason: ${rawItem.reason})`);
        }

        const itemEntry = entries.find(rawItem.href);
        if (isExists(itemEntry)) {
          rawItem.size = itemEntry.size;

          if (rawItem.itemType === SpineItem) {
            // Checks if item is referenced in spine list.
            const refIndex = itemRefs.findIndex(itemRef => itemRef.idref === rawItem.id);
            if (refIndex >= 0) {
              // If isLinear is false, then index is not assigned.
              // Because this spine is excluded from flow.
              const ref = itemRefs[refIndex];
              rawItem.isLinear = isExists(ref.linear) ? parseBool(ref.linear) : true;
              if (options.ignoreLinear || rawItem.isLinear) {
                rawItem.index = refIndex;
              }
            } else {
              rawItem.itemType = DeadItem;
              rawItem.reason = DeadItem.Reason.NOT_SPINE;
              Logger.warn(`Referenced resource '${rawItem.id}' ignored. (reason: ${rawItem.reason})`);
            }
          } else if (rawItem.itemType === ImageItem) {
            if (!context.foundCover) {
              // EPUB2 spec doesn't have cover image declaration, it founding for cover image in order listed below.
              // 1. metadata.meta[name="cover"].content === imageItem.id
              // 2. imageItem.id === 'cover'
              // 3. guide.reference[type="cover"].href === imageItem.href (see _parseGuide)
              if (isExists(coverMeta) && rawItem.id === coverMeta.content) {
                rawItem.isCover = true;
                context.foundCover = true;
              } else if (rawItem.id.toLowerCase() === 'cover') {
                rawItem.isCover = true;
                context.foundCover = true;
              }
            }
          } else if (rawItem.itemType === NcxItem) {
            // NCX is valid only if rawItem.id matches tocId.
            if (rawItem.id !== tocId) {
              rawItem.itemType = DeadItem;
              rawItem.reason = DeadItem.Reason.NOT_NCX;
              Logger.warn(`Referenced resource '${rawItem.id}' ignored. (reason: ${rawItem.reason})`);
            }
          }

          if (options.parseStyle) {
            if (rawItem.itemType === CssItem) {
              rawItem.namespace = `${options.styleNamespacePrefix}${idx}`;
            } else if (rawItem.itemType === SpineItem) {
              const result = await this._parseSpineStyle(rawItem, itemEntry, options);
              rawItem.styles = result.styles;
              inlineStyles = inlineStyles.concat(result.inlineStyles);
            }
          }
        } else {
          rawItem.itemType = DeadItem;
          rawItem.reason = DeadItem.Reason.NOT_EXISTS;
          Logger.warn(`Referenced resource '${rawItem.id}' ignored. (reason: ${rawItem.reason})`);
        }
        rawBook.items.push(rawItem);
      });
    }, Promise.resolve());

    rawBook.items = [...rawBook.items, ...inlineStyles];

    return context;
  }

  /**
   * @typedef {object} StyleParseResult
   * @property {string[]} styles path of styles linked to spine
   * @property {object[]} inlineStyles inline styles included in Spine
   */
  /**
   * @param {object} rawItem
   * @param {object} entry spine entry
   * @param {object} options parse options
   * @returns {StyleParseResult} returns styles and inline style from spine
   * @see EpubParser.parseDefaultOptions.styleNamespacePrefix
   */
  async _parseSpineStyle(rawItem, entry, options) {
    const styles = [];
    const inlineStyles = [];

    const find = (list, property, value) => list.find(item => item[property] === value);
    const filter = (list, property, value) => list.filter(item => item[property] === value);

    const document = parseHtml(await entry.getFile('utf8'));
    const html = find(document, 'tagName', 'html');
    const head = find(html.children, 'tagName', 'head');

    // <link rel="stylesheet" type="text/css" href="..." ... />
    //                                              ^~~
    filter(head.children, 'tagName', 'link').forEach((link) => {
      const { attributes: attrs } = link;
      if (isExists(attrs)) {
        const rel = find(attrs, 'key', 'rel');
        const type = find(attrs, 'key', 'type');
        if ((isExists(rel) && rel.value === 'stylesheet') || (isExists(type) && type.value === 'text/css')) {
          const href = find(attrs, 'key', 'href');
          if (isExists(href) && isExists(href.value) && !isUrl(href.value)) {
            // href="../Styles/Style0001.css" => href="OEBPS/Styles/Style0001.css"
            styles.push(safePathJoin(safeDirname(rawItem.href), href.value));
          }
        }
      }
    });

    // <style ...>...</style>
    //            ^~~
    filter(head.children, 'tagName', 'style').forEach((style, idx) => {
      const firstNode = style.children[0];
      if (isExists(firstNode)) {
        const namespace = `${options.styleNamespacePrefix}${idx}`;
        const href = `${rawItem.href}_${namespace}`;
        const content = firstNode.content || '';
        const inlineStyleItem = {
          id: `${rawItem.id}_${namespace}`,
          href,
          mediaType: 'text/css',
          size: content.length,
          itemType: InlineCssItem,
          namespace,
          style: content,
        };
        styles.push(inlineStyleItem.href);
        inlineStyles.push(inlineStyleItem);
      }
    });

    return { styles, inlineStyles };
  }

  /**
   * Guide parsing in OPF
   * @param {object} guide guide AST
   * @param {Context} context intermediate result
   * @returns {Promise.<Context>} return Context containing guide
   */
  _parseGuide(guide, context) {
    return new Promise((resolve) => {
      const { rawBook } = context;
      let { foundCover } = context;
      rawBook.guides = [];
      if (isExists(guide)) {
        getValues(guide.reference).forEach((reference) => {
          // If reference.type equal 'cover' and there is an image item matching reference.href, it is cover image.
          if (!foundCover && isExists(reference.type) && reference.type.toLowerCase() === Guide.Types.COVER) {
            const imageItem = rawBook.items.find(item => item.href === reference.href && item.itemType === ImageItem);
            if (isExists(imageItem)) {
              imageItem.isCover = true;
              foundCover = true;
            }
          }
          rawBook.guides.push(mergeObjects(reference, { href: safePathJoin(context.basePath, reference.href) }));
        });
      }
      resolve(context);
    });
  }

  /**
   * NCX parsing
   * @param {Context} context intermediate result
   * @returns {Promise.<Context>} return Context containing ncx if exists
   * @throws {Errors.EINVAL} invalid XML
   * @throws {Errors.EINVAL} can not found ncx attribute OPF
   * @throws {Errors.ENOFILE} NCX not found
   * @throws {Errors.ENOELMT} no such element in NCX
   * @see EpubParser.parseDefaultOptions.allowNcxFileMissing
   */
  async _parseNcx(context) {
    const { rawBook, entries, options } = context;
    const { allowNcxFileMissing } = options;
    const ncxItem = rawBook.items.find(item => item.itemType === NcxItem);
    if (isExists(ncxItem)) {
      const ncxEntry = entries.find(ncxItem.href);
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
      const { ncx } = xmlLoader(await ncxEntry.getFile('utf8'));
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
    } else if (!allowNcxFileMissing) {
      throw createError(Errors.EINVAL, 'opf', 'reason', 'can not found ncx attribute');
    }

    return context;
  }

  /**
   * Unzipping if zip source and unzipPath option specified
   * @param {Context} context intermediate result
   * @returns {Promise.<Context>} return Context (no change at this step)
   * @throws {Errors.ENOENT} no such file or directory
   * @see EpubParser.parseDefaultOptions.unzipPath
   * @see EpubParser.parseDefaultOptions.overwrite
   */
  async _unzipIfNeeded(context) {
    const { options, entries } = context;
    const { unzipPath, overwrite } = options;
    if (!isString(entries.source) && isExists(unzipPath)) {
      await entries.source.extractAll(unzipPath, overwrite);
      privateProps.set(this, { ...privateProps.get(this), input: unzipPath });
    }
    return context;
  }

  /**
   * Create new Book from context
   * @param {Context} context intermediate result
   * @returns {Promise.<Book>} return Book
   */
  _createBook(context) {
    return new Promise((resolve) => {
      resolve(new Book(context.rawBook));
    });
  }

  /**
   * Reading contents of Item
   * @param {Item} item target
   * @param {?object} options read options
   * @returns {(string|Buffer)} reading result
   * @see EpubParser.readDefaultOptions
   * @see EpubParser.readOptionTypes
   * @example
   * const options = { ... };
   * parse.readItem(book.spine[0], options).then((result) => {
   *   ...
   * });
   */
  async readItem(item, options = {}) {
    const results = await this.readItems([item], options);
    return results[0];
  }

  /**
   * Reading contents of Items
   * @param {Item[]} items targets
   * @param {?object} options read options
   * @returns {(string|Buffer)[]} reading results
   * @see EpubParser.readDefaultOptions
   * @see EpubParser.readOptionTypes
   * @example
   * const options = { ... };
   * parse.readItems(book.styles, options).then((results) => {
   *   ...
   * });
   */
  async readItems(items, options = {}) {
    const context = await this._prepareRead(items, options);
    const results = await this._read(context);
    return results;
  }

  /**
   * @typedef ReadContext
   * @property {Item[]} items targets
   * @property {object} entries from input
   * @property {object} options read options
   */
  /**
   * Validate read options and get entries from input
   * @param {Item[]} items targets
   * @param {?object} options read options
   * @returns {Promise.<ReadContext>}
   *          returns ReadContext containing target items, read options, entries
   * @throws {Errors.EINVAL} invalid options or value type
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.ENOFILE} no such file
   * @see EpubParser.readDefaultOptions
   * @see EpubParser.readOptionTypes
   */
  async _prepareRead(items, options = {}) {
    if (items.find(item => !(item instanceof Item))) {
      throw createError(Errors.EINVAL, 'item', 'reason', 'item must be Item type');
    }
    validateOptions(options, EpubParser.readOptionTypes);
    const entries = await readEntries(this.input, this.cryptoProvider);
    return {
      items,
      entries,
      options: mergeObjects(EpubParser.readDefaultOptions, options),
    };
  }

  /**
   * Contents is read using loader suitable for context
   * @param {ReadContext} context properties required for reading
   * @returns {(string|Buffer)[]} reading results
   * @throws {Errors.ENOFILE} no such file
   */
  async _read(context) {
    const { items, entries, options } = context;
    const results = [];
    await items.reduce((prevPromise, item) => { // eslint-disable-line arrow-body-style
      return prevPromise.then(async () => {
        if (item instanceof InlineCssItem) {
          results.push(cssLoader(item, item.text, options));
          return;
        }

        const entry = entries.find(item.href);
        if (!isExists(entry)) {
          throw createError(Errors.ENOFILE, item.href);
        }

        const file = await entry.getFile(item.defaultEncoding);
        if (item instanceof SpineItem) {
          results.push(spineLoader(item, file, options));
        } else if (item instanceof CssItem) {
          results.push(cssLoader(item, file, options));
        } else {
          results.push(file);
        }
      });
    }, Promise.resolve());
    return results;
  }

  /**
   * @param {string} mediaType
   * @return {*} item type by media-type
   */
  getItemTypeFromMediaType(mediaType) {
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
      'font/opentype': FontItem,
      'font/otf': FontItem,
      'font/woff2': FontItem,

      'application/x-dtbncx+xml': NcxItem,

      'application/xhtml+xml': SpineItem,

      'text/css': CssItem,

      'image/gif': ImageItem,
      'image/jpeg': ImageItem,
      'image/png': ImageItem,
      'image/bmp': ImageItem, // Not recommended in EPUB spec.

      'image/svg+xml': SvgItem,
    };

    const type = types[mediaType.toLowerCase()];
    return isExists(type) ? type : DeadItem;
  }
}

export default EpubParser;
