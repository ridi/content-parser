import { mergeObjects } from '../util';
import Item from './Item';

class ImageItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    this.isCover = rawObj.isCover || false;
    if (this.constructor === ImageItem) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      isCover: this.isCover,
      itemType: ImageItem.name,
    });
  }
}

export default ImageItem;
