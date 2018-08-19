import Item from './Item';
import { objectMerge } from '../utils';

class ImageItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    this.isCover = rawObj.isCover || false;
    Object.freeze(this);
  }

  toRaw() {
    return objectMerge(super.toRaw(), {
      isCover: this.isCover,
      itemType: ImageItem.name,
    });
  }
}

export default ImageItem;
