import { mergeObjects } from '@ridi/parser-core';

import CssItem from './CssItem';

/**
 * @typedef {Object} InlineCssItemExtra
 * @property {string} [style]
 *
 * @typedef {import('./CssItem').CssItemParam & InlineCssItemExtra} InlineCssItemParam
 */
class InlineCssItem extends CssItem {
  /**
   * @type {string}
   */
  style;

  /**
   *
   * @param {InlineCssItemParam} rawObj
   * @param {boolean} freeze
   */
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
      ItemType: 'InlineCssItem',
    });
  }
}

export default InlineCssItem;
