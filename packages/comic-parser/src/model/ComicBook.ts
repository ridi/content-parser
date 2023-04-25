import { BaseBook } from "@ridi/parser-core";

import ComicItem, { ComicItemProperties } from "./ComicItem";

type ComicBookProps = {
  items?: ComicItemProperties[];
};

class ComicBook extends BaseBook {
  items: ComicItem[];

  constructor(rawBook: ComicBookProps = {}) {
    super();
    this.items = (rawBook.items || []).map((rawObj) => new ComicItem(rawObj));
    Object.freeze(this);
  }

  toRaw() {
    return {
      items: this.items.map((item) => item.toRaw()),
    };
  }
}

export default ComicBook;
