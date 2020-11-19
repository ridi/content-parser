import { BaseItem, isExists } from '@ridi/parser-core';
import { BaseItemProps } from '@ridi/parser-core/type/BaseItem';
import path from 'path';
/**
 * @typedef {Object} ComicItemProperties
 * @property {number} [index]
 * @property {string} [path]
 * @property {number} [width]
 * @property {number} [height]
 */
interface ComicItemProps extends BaseItemProps {
  index: number;
  path: string;
  width: number;
  height: number;
}
class ComicItem extends BaseItem {

  index: number;

  path: string;

  width: number;

  height: number;

  get mimeType(): string {
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
  constructor(rawObj: ComicItemProps, freeze = true) {
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
