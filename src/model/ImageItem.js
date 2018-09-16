import Item from './Item';
import mergeObjects from '../util/mergeObjects';

class ImageItem extends Item {
  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    this.isCover = rawObj.isCover || false;
    /* istanbul ignore else: untestable */
    if (freeze && this.constructor === ImageItem) {
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
