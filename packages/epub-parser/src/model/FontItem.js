import { mergeObjects } from '@ridi/parser-core';

import BaseEpubItem from './BaseEpubItem';

class FontItem extends BaseEpubItem {
  /**
   * @param {import('./BaseEpubItem').BaseEpubItemParam} [rawObj]
   * @param {boolean} [freeze]
  */
  /* istanbul ignore next */
  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    /* istanbul ignore else */
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      itemType: 'FontItem',
    });
  }
}

export default FontItem;
