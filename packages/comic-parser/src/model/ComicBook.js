import { BaseBook } from '@ridi/parser-core';
import ComicItem from './ComicItem';

class ComicBook extends BaseBook {
  /**
   * @type {ComicItem[]}
   */
  items

  constructor(rawBook = {}) {
    super(rawBook);
    this.items = (rawBook.items || []).map(rawObj => new ComicItem(rawObj));
    Object.freeze(this);
  }

  toRaw() {
    return {
      items: this.items.map(item => item.toRaw()),
    };
  }
}

export default ComicBook;
