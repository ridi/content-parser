import { mergeObjects } from '@ridi/parser-core';

import ImageItem from './ImageItem';

class SvgItem extends ImageItem {
  get defaultEncoding() { return 'utf8'; }

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
      itemType: 'SvgItem',
    });
  }
}

export default SvgItem;
