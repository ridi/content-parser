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
      default: return '';
    }
  }

  constructor(rawObj = {}, freeze = true) {
    this.index = rawObj.index;
    this.path = rawObj.path;
    this.size = rawObj.size;
    /* istanbul ignore else: untestable */
    if (freeze && this.constructor === Item) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return {
      index: this.index,
      path: this.path,
      size: this.size,
    };
  }
}

export default Item;
