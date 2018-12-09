import { isExists, isString } from '@ridi/parser-core';

import Author from './Author';
import CssItem from './CssItem';
import DateTime from './DateTime';
import DeadItem from './DeadItem';
import FontItem from './FontItem';
import Guide from './Guide';
import Identifier from './Identifier';
import ImageItem from './ImageItem';
import InlineCssItem from './InlineCssItem';
import Item from './Item';
import Meta from './Meta';
import NcxItem from './NcxItem';
import SpineItem from './SpineItem';
import Version from './Version';

function postSpines(spines, styles) {
  const firstSpine = spines[0];
  spines.sort((s1, s2) => (s1.index < 0 || s2.index < 0 ? 0 : s1.index - s2.index))
    .forEach((spine, idx, list) => {
      const prevSpine = list[idx - 1];
      const nextSpine = list[idx + 1];
      spine.prev = () => prevSpine;
      spine.next = () => nextSpine;
      spine.first = () => firstSpine;
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
    ncx.navPoints.forEach((navPoint) => {
      navPoint.spine = spines.find((spine) => {
        const href = navPoint.src.replace(navPoint.anchor || '', '');
        return spine.href === href;
      });
      Object.freeze(navPoint);
    });
    Object.freeze(ncx);
  }
}

function postGuides(guides, spines) {
  guides.forEach((guide) => {
    guide.item = spines.find(spine => spine.href === guide.href);
    Object.freeze(guide);
  });
}

function getItemTypeFromString(string) {
  switch (string) {
    case Item.name: return Item;
    case SpineItem.name: return SpineItem;
    case NcxItem.name: return NcxItem;
    case FontItem.name: return FontItem;
    case ImageItem.name: return ImageItem;
    case CssItem.name: return CssItem;
    case InlineCssItem.name: return InlineCssItem;
    default: return DeadItem;
  }
}

/* eslint-disable new-cap */
class Book {
  constructor(rawBook = {}) {
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
    this.language = rawBook.language;
    this.relation = rawBook.relation;
    this.coverage = rawBook.coverage;
    this.rights = rawBook.rights;
    this.version = new Version(rawBook.version);
    this.metas = (rawBook.metas || []).map(rawObj => new Meta(rawObj));
    this.items = (rawBook.items || []).map((rawObj) => {
      let { itemType } = rawObj;
      let freeze = true;
      if (isString(itemType)) {
        itemType = getItemTypeFromString(itemType);
      }
      if (itemType === SpineItem || itemType === NcxItem) {
        freeze = false;
      }
      return new itemType(rawObj, freeze);
    });
    this.spines = this.items.filter(item => item instanceof SpineItem);
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
      language: this.language,
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
