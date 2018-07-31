import CssItem from './CssItem';
import FontItem from './FontItem';
import ImageItem from './ImageItem';
import NcxItem from './NcxItem';
import SpineItem from './SpineItem';

class Book {
  get titles() { return this._titles || []; }

  get creators() { return this._creators || []; }

  get subjects() { return this._subjects || []; }

  get description() { return this._description; }

  get publisher() { return this._publisher; }

  get contributors() { return this._contributors || []; }

  get date() { return this._date; }

  get type() { return this._type; }

  get format() { return this._format; }

  get identifier() { return this._identifier; }

  get source() { return this._source; }

  get language() { return this._language; }

  get relation() { return this._relation; }

  get coverage() { return this._coverage; }

  get rights() { return this._rights; }

  get epubVersion() { return this._epubVersion; }

  get checkSum() { return this._checkSum || 0; }

  get items() { return this._items || []; }

  get ncx() { return this.items.filter(item => item instanceof NcxItem)[0]; }

  get spines() { return this.items.filter(item => item instanceof SpineItem); }

  get fonts() { return this.items.filter(item => item instanceof FontItem); }

  get images() { return this.items.filter(item => item instanceof ImageItem); }

  get styles() { return this.items.filter(item => item instanceof CssItem); }

  get guide() { return this._guide || []; }
}

export default Book;
