import { BaseItem, isExists } from '@ridi/parser-core';

import path from 'path';

/**
 * @typedef {Object} ComicItemProperties
 * @property {number} [index]
 * @property {string} [path]
 * @property {number} [width]
 * @property {number} [height]
 */

class ComicItem extends BaseItem {
  /**
   * @type {number}
   */
  index;

  /**
   * @type {string}
   */
  path;

  /**
   * @type {number}
   */
  width;

  /**
     * @type {number}
   */
  height;

  /**
   * @return {string}
   */
  get mimeType() {
    const ext = path.extname(this.path).toLocaleLowerCase().replace('.', '');
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'bmp':
      case 'gif':
        return `image/${ext}`;
      default:
        return '';
    }
  }

  /**
   *
   * @param {ComicItemProperties} rawObj
   * @param {boolean} freeze
   */
  constructor(rawObj = {}, freeze = true) {
    super(rawObj);
    this.index = rawObj.index;
    this.path = rawObj.path;
    if (isExists(rawObj.width)) {
      this.width = rawObj.width;
    }
    if (isExists(rawObj.height)) {
      this.height = rawObj.height;
    }
    /* istanbul ignore else */
    if (freeze && this.constructor === ComicItem) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return {
      index: this.index,
      path: this.path,
      size: this.size,
      ...(isExists(this.width) ? { width: this.width } : {}),
      ...(isExists(this.height) ? { height: this.height } : {}),
    };
  }
}

export default ComicItem;
