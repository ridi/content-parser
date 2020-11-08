import { isExists, mergeObjects } from '@ridi/parser-core';

import BaseEpubItem from './BaseEpubItem';

/**
 * @typedef {Object} CssItemExtra
 * @property {string} [namespace]
 *
 * @typedef {import('./BaseEpubItem').BaseEpubItemParam & CssItemExtra} CssItemParam
 */
class CssItem extends BaseEpubItem {
  get defaultEncoding() { return 'utf8'; }

  /**
   * @type {string}
   */
  namespace;

  /**
   *
   * @param {CssItemParam} rawObj
   * @param {boolean} freeze
   */
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
