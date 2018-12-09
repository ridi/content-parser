import { mergeObjects } from '@ridi/parser-core';

import Item from './Item';

class FontItem extends Item {
  constructor(rawObj = {}, freeze = true) {
    const _ = super(rawObj, freeze); // eslint-disable-line
    /* istanbul ignore else: untestable */
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      itemType: FontItem.name,
    });
  }
}

export default FontItem;
