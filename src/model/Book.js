import CoverImageItem from './CoverImageItem';
import CssItem from './CssItem';
import FontItem from './FontItem';
import ImageItem from './ImageItem';
import NcxItem from './NcxItem';
import SpineItem from './SpineItem';

class Book {
  static get defaultProps() {
    return {
      titles: [],
      creators: [],
      subjects: [],
      contributors: [],
      dates: [],
      identifiers: [],
      checkSum: 0,
      items: [],
      guide: [],
    };
  }

  get titles() { return this._titles || Book.defaultProps.titles; }

  get creators() { return this._creators || Book.defaultProps.creators; }

  get subjects() { return this._subjects || Book.defaultProps.subjects; }

  get description() { return this._description; }

  get publisher() { return this._publisher; }

  get contributors() { return this._contributors || Book.defaultProps.contributors; }

  get dates() { return this._date || Book.defaultProps.dates; }

  get type() { return this._type; }

  get format() { return this._format; }

  get identifiers() { return this._identifiers || Book.defaultProps.identifiers; }

  get source() { return this._source; }

  get language() { return this._language; }

  get relation() { return this._relation; }

  get coverage() { return this._coverage; }

  get rights() { return this._rights; }

  get epubVersion() { return this._epubVersion; }

  get checkSum() { return this._checkSum || Book.defaultProps.checkSum; }

  get items() { return this._items || Book.defaultProps.items; }

  get ncx() { return this.items.find(item => item instanceof NcxItem); }

  get spines() { return this.items.filter(item => item instanceof SpineItem); }

  get fonts() { return this.items.filter(item => item instanceof FontItem); }

  get cover() { return this.items.find(item => item instanceof CoverImageItem); }

  get images() { return this.items.filter(item => item instanceof ImageItem); }

  get styles() { return this.items.filter(item => item instanceof CssItem); }

  get guide() { return this._guide || Book.defaultProps.guide; }
}

export default Book;
