import { mergeObjects } from '@ridi/parser-core';

import Item from './Item';

class ImageItem extends Item {
  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    this.isCover = rawObj.isCover || false;
    /* istanbul ignore else */
    if (freeze && this.constructor === ImageItem) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      isCover: this.isCover,
      itemType: 'ImageItem',
    });
  }
}

export default ImageItem;
