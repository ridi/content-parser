import { isExists } from '@ridi/parser-core';
import path from 'path';

class Item {
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

  constructor(rawObj = {}, freeze = true) {
    this.index = rawObj.index;
    this.path = rawObj.path;
    this.fileSize = rawObj.fileSize;
    if (isExists(rawObj.width)) {
      this.width = rawObj.width;
    }
    if (isExists(rawObj.height)) {
      this.height = rawObj.height;
    }
    /* istanbul ignore else */
    if (freeze && this.constructor === Item) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return {
      index: this.index,
      path: this.path,
      fileSize: this.fileSize,
      ...(isExists(this.width) ? { width: this.width } : {}),
      ...(isExists(this.height) ? { height: this.height } : {}),
    };
  }
}

export default Item;
