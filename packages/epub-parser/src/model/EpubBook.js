import {
  BaseBook, isExists, isString, Version,
} from '@ridi/parser-core';

import Author from './Author';
import CssItem from './CssItem';
import DateTime from './DateTime';
import DeadItem from './DeadItem';
import FontItem from './FontItem';
import Guide from './Guide';
import Identifier from './Identifier';
import ImageItem from './ImageItem';
import InlineCssItem from './InlineCssItem';
import Meta from './Meta';
import NcxItem from './NcxItem';
import SpineItem from './SpineItem';
import BaseEpubItem from './BaseEpubItem';

function postSpines(spines, styles) {
  const firstSpine = spines[0];
  spines.sort((s1, s2) => s1.index - s2.index)
    .forEach((spine, idx, list) => {
      const prevSpine = list[idx - 1];
      const nextSpine = list[idx + 1];
      spine.prev = () => prevSpine;
      spine.next = () => nextSpine;
      spine.first = () => firstSpine;
      /* istanbul ignore else */
      if (isExists(spine.styles)) {
        spine.styles = spine.styles
          .map(href => styles.find(style => style.href === href))
          .filter(style => isExists(style));
      }
      Object.freeze(spine);
    });
}

function postNcx(ncx, spines) {
  if (isExists(ncx)) {
    const spineMapping = (navPoint) => {
      navPoint.spine = spines.find((spine) => {
        const href = navPoint.src.replace(`#${navPoint.anchor || ''}`, '');
        return spine.href === href;
      });
      navPoint.children.forEach(child => spineMapping(child));
      Object.freeze(navPoint);
    };
    ncx.navPoints.forEach(navPoint => spineMapping(navPoint));
    Object.freeze(ncx);
  }
}

function postGuides(guides, spines) {
  guides.forEach((guide) => {
    guide.item = spines.find(spine => spine.href === guide.href);
    Object.freeze(guide);
  });
}

/* istanbul ignore next */
function getItemTypeFromString(string) {
  switch (string) {
    case 'Item': return BaseEpubItem;
    case 'SpineItem': return SpineItem;
    case 'NcxItem': return NcxItem;
    case 'FontItem': return FontItem;
    case 'ImageItem': return ImageItem;
    case 'CssItem': return CssItem;
    case 'InlineCssItem': return InlineCssItem;
    default: return DeadItem;
  }
}

/* eslint-disable new-cap */
class Book extends BaseBook {
  /**
   * @type {string}
   */
  titles;

  /**
   * @type {import('./Author').default[]}
   */
  creators;

  /**
   * @type {string[]}
   */
  subjects;

  /**
   * @type {string}
   */
  description;

  /**
   * @type {string}
   */
  publisher;

  /**
   * @type {import('./Author').default[]}
   */
  contributors;

  /**
   * @type {import('./DateTime').default[]};
   */
  dates;

  /**
   * @type {string}
   */
  type;

  /**
   * @type {string}
   */
  format;

  /**
   * @type {import('./Identifier').default[]};
   */
  identifiers;

  /**
   * @type {string}
   */
  source;

  /**
   * @type {string[]}
   */
  languages;

  /**
   * @type {string}
   */
  relation;

  /**
   * @type {string}
   */
  coverage;

  /**
   * @type {string}
   */
  rights;

  /**
   * @type {import('@ridi/parser-core').Version}
   */
  version;

  /**
   * @type {import('./Meta').default[]}
   */
  metas;

  /**
   * @type {import('./BaseEpubItem').default[]}
   */
  items;

  /**
   * @type {import('./SpineItem').default[]}
   */
  spines;

  /**
   * @type {import('./NcxItem').default[]}
   */
  ncx

  /**
   * @type {import('./FontItem').default[]}
   */
  fonts

  /**
   * @type {import('./ImageItem').default}
   */
  cover;

  /**
   * @type {import('./ImageItem').default[]}
   */
  images;

  /**
   * @type {import('./CssItem').default[]}
   */
  styles;

  /**
   * @type {import('./Guide').default[]}
   */
  guides;

  /**
   * @type {import('./DeadItem').default[]}
   */
  deadItems;

  /**
   * @typedef {Object} EpubBookExtra
   * @property {string} [titles]
   * @property {Author} [creators]
   * @property {string[]} [subjects]
   * @property {string} [description]
   * @property {string} [publisher]
   * @property {Author[]} [contributors]
   * @property {DateTime[]} [dates]
   * @property {string} [type]
   * @property {string} [format]
   * @property {Identifier[]} [identifiers]
   * @property {string} [source]
   * @property {string[]} [languages]
   * @property {string} [relation]
   * @property {string} [coverage]
   * @property {string} [rights]
   * @property {Version} [version]
   * @property {Meta[]} [metas]
   * @property {import('./BaseEpubItem')[]} [items]
   *
   * @typedef {BaseBook & EpubBookExtra} EpubBookParam
   */
  /**
   *
   * @param {EpubBookParam} rawBook
   */
  constructor(rawBook = {}) {
    super();
    this.titles = rawBook.titles || [];
    this.creators = (rawBook.creators || []).map(rawObj => new Author(rawObj));
    this.subjects = rawBook.subjects || [];
    this.description = rawBook.description;
    this.publisher = rawBook.publisher;
    this.contributors = (rawBook.contributors || []).map(rawObj => new Author(rawObj));
    this.dates = (rawBook.dates || []).map(rawObj => new DateTime(rawObj));
    this.type = rawBook.type;
    this.format = rawBook.format;
    this.identifiers = (rawBook.identifiers || []).map(rawObj => new Identifier(rawObj));
    this.source = rawBook.source;
    this.languages = rawBook.languages || [];
    this.relation = rawBook.relation;
    this.coverage = rawBook.coverage;
    this.rights = rawBook.rights;
    this.version = new Version(rawBook.version);
    this.metas = (rawBook.metas || []).map(rawObj => new Meta(rawObj));
    this.items = (rawBook.items || []).map((rawObj) => {
      let { itemType } = rawObj;
      if (isString(itemType)) {
        itemType = getItemTypeFromString(itemType);
      }
      const freeze = !(itemType === SpineItem || itemType === NcxItem);
      return new itemType(rawObj, freeze);
    });
    this.spines = this.items
      .filter(item => item instanceof SpineItem)
      .sort((lhs, rhs) => lhs.index - rhs.index);
    this.ncx = this.items.find(item => item instanceof NcxItem);
    this.fonts = this.items.filter(item => item instanceof FontItem);
    this.cover = this.items.find(item => item.isCover);
    this.images = this.items.filter(item => item instanceof ImageItem);
    this.styles = this.items.filter(item => item instanceof CssItem);
    this.guides = (rawBook.guides || []).map(rawObj => new Guide(rawObj, false));
    this.deadItems = this.items.filter(item => item instanceof DeadItem);
    postSpines(this.spines, this.styles);
    postNcx(this.ncx, this.spines);
    postGuides(this.guides, this.spines);
    Object.freeze(this);
  }

  toRaw() {
    return {
      titles: this.titles,
      creators: this.creators.map(creator => creator.toRaw()),
      subjects: this.subjects,
      description: this.description,
      publisher: this.publisher,
      contributors: this.contributors.map(contributor => contributor.toRaw()),
      dates: this.dates.map(date => date.toRaw()),
      type: this.type,
      format: this.format,
      identifiers: this.identifiers.map(identifier => identifier.toRaw()),
      source: this.source,
      languages: this.languages,
      relation: this.relation,
      coverage: this.coverage,
      rights: this.rights,
      version: this.version.toString(),
      metas: this.metas.map(meta => meta.toRaw()),
      items: this.items.map(item => item.toRaw()),
      guides: this.guides.map(guide => guide.toRaw()),
    };
  }
}

export default Book;
