import { isExists, mergeObjects } from '@ridi/parser-core';

import Item from './Item';

class SpineItem extends Item {
  get defaultEncoding() { return 'utf8'; }

  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    this.index = rawObj.index;
    this.isLinear = isExists(rawObj.isLinear) ? rawObj.isLinear : true;
    if (isExists(rawObj.styles)) {
      this.styles = rawObj.styles;
    }
    this.first = () => undefined;
    this.prev = () => undefined;
    this.next = () => undefined;
    /* istanbul ignore else: untestable */
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    let rawObject = mergeObjects(super.toRaw(), {
      index: this.index,
      isLinear: this.isLinear,
      itemType: SpineItem.name,
    });
    if (isExists(this.styles)) {
      rawObject = mergeObjects(rawObject, {
        styles: this.styles.map(style => style.href),
      });
    }
    return rawObject;
  }
}

export default SpineItem;
