import Author from './Author';
import CssItem from './CssItem';
import DateTime from './DateTime';
import FontItem from './FontItem';
import Identifier from './Identifier';
import ImageItem from './ImageItem';
import NcxItem from './NcxItem';
import SpineItem from './SpineItem';

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
    this.epubVersion = rawBook.epubVersion;
    this.checkSum = rawBook.checkSum || 0;
    this.items = (rawBook.items || []).map(rawObj => new rawObj.itemType(rawObj)); /* eslint-disable-line new-cap */
    this.ncx = this.items.find(item => item instanceof NcxItem);
    this.spines = this.items.filter(item => item instanceof SpineItem);
    this.fonts = this.items.filter(item => item instanceof FontItem);
    this.cover = this.items.find(item => item.isCover);
    this.images = this.items.filter(item => item instanceof ImageItem);
    this.styles = this.items.filter(item => item instanceof CssItem);
    this.guide = this.items.filter(item => item instanceof CssItem);
    Object.freeze(this);
  }
}

export default Book;
