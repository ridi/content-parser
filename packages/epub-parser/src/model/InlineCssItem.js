import { mergeObjects } from '@ridi/parser-core';

import CssItem from './CssItem';

class InlineCssItem extends CssItem {
  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    this.style = rawObj.style || '';
    /* istanbul ignore else */
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      style: this.style,
      itemType: 'InlineCssItem',
    });
  }
}

export default InlineCssItem;
