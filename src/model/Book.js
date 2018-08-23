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
import { isString, mergeObjects } from '../utils';

/* eslint-disable new-cap */
class Book {
  constructor(rawBook = {}) {
    const findItem = href => this.items.find(item => item.href === href);
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
    this.epubVersion = rawBook.epubVersion;
    this.metas = (rawBook.metas || []).map(rawObj => new Meta(rawObj));
    this.items = (rawBook.items || []).map((rawObj) => {
      let { itemType } = rawObj;
      if (isString(itemType)) {
        if (itemType === Item.name) {
          itemType = Item;
        } else if (itemType === NcxItem.name) {
          itemType = NcxItem;
        } else if (itemType === SpineItem.name) {
          itemType = SpineItem;
        } else if (itemType === FontItem.name) {
          itemType = FontItem;
        } else if (itemType === ImageItem.name) {
          itemType = ImageItem;
        } else if (itemType === CssItem.name) {
          itemType = CssItem;
        } else if (itemType === InlineCssItem.name) {
          itemType = InlineCssItem;
        } else {
          itemType = DeadItem;
        }
      }
      return new itemType(mergeObjects(rawObj, { findItem }));
    });
    this.ncx = this.items.find(item => item instanceof NcxItem);
    this.spines = this.items.filter(item => item instanceof SpineItem);
    this.fonts = this.items.filter(item => item instanceof FontItem);
    this.cover = this.items.find(item => item.isCover);
    this.images = this.items.filter(item => item instanceof ImageItem);
    this.styles = this.items.filter(item => item instanceof CssItem);
    this.guide = (rawBook.guide || []).map(rawObj => new Guide(mergeObjects(rawObj, { findItem })));
    this.deadItems = this.items.filter(item => item instanceof DeadItem);
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
      epubVersion: this.epubVersion,
      metas: this.metas.map(meta => meta.toRaw()),
      items: this.items.map(item => item.toRaw()),
      guide: this.guide.map(guide => guide.toRaw()),
    };
  }
}

export default Book;
