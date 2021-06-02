import { BaseItem } from '@ridi/parser-core';

/**
 * @typedef {Object} BaseEpubItemExtra
 * @property {string} [id]
 * @property {string} [href]
 * @property {string} [mediaType]
 *
 * @typedef {import('@ridi/parser-core/type/BaseItem').BaseItemParam & BaseEpubItemExtra} BaseEpubItemParam
*/
class BaseEpubItem extends BaseItem {
  /**
   * @returns {boolean}
  */
  get isFileExists() { return this.size !== undefined; }

  /**
   * @abstract
  */
  get defaultEncoding() { return undefined; }

  /**
   * @type {string}
  */
  id;

  /**
   * @type {string}
  */
  href;

  /**
   * @type {string}
  */
  mediaType;

  /**
   *
   * @param {BaseEpubItemParam} rawObj
   * @param {boolean} freeze
  */
  constructor(rawObj = {}, freeze = true) {
    super(rawObj);
    this.id = rawObj.id;
    this.href = rawObj.href;
    this.mediaType = rawObj.mediaType;
    /* istanbul ignore else */
    if (freeze && this.constructor === BaseEpubItem) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return {
      id: this.id,
      href: this.href,
      mediaType: this.mediaType,
      size: this.size,
      ItemType: 'Item',
    };
  }
}

export default BaseEpubItem;
