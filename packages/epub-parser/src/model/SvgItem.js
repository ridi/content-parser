import { mergeObjects } from '@ridi/parser-core';

import ImageItem from './ImageItem';

class SvgItem extends ImageItem {
  get defaultEncoding() { return 'utf8'; }

  constructor(rawObj = {}, freeze = true) /* istanbul ignore next: untestable */ {
    const _ = super(rawObj, freeze); // eslint-disable-line
    /* istanbul ignore else: untestable */
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      itemType: SvgItem.name,
    });
  }
}

export default SvgItem;
