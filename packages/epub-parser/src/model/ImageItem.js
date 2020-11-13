import { mergeObjects } from '@ridi/parser-core';

import BaseEpubItem from './BaseEpubItem';

/**
 * @typedef {Object} ImageItemExtra
 * @property {boolean} [isCover]
 *
 * @typedef {import('./BaseEpubItem').BaseEpubItemParam & ImageItemExtra} ImageItemParam
 */
class ImageItem extends BaseEpubItem {
  /**
   * @type {boolean}
   */
  isCover;

  /**
   *
   * @param {ImageItemParam} rawObj
   * @param {boolean} freeze
   */
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
