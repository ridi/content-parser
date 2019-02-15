import { isExists, mergeObjects } from '@ridi/parser-core';

import Item from './Item';

class CssItem extends Item {
  get defaultEncoding() { return 'utf8'; }

  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    if (isExists(rawObj.namespace)) {
      this.namespace = rawObj.namespace;
    }
    /* istanbul ignore else */
    if (freeze && this.constructor === CssItem) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      namespace: this.namespace,
      itemType: 'CssItem',
    });
  }
}

export default CssItem;
