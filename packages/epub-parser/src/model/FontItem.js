import { mergeObjects } from '@ridi/parser-core';

import Item from './Item';

class FontItem extends Item {
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
