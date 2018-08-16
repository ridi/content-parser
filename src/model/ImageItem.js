import Item from './Item';

class ImageItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    this.isCover = rawObj.isCover || false;
    Object.freeze(this);
  }
}

export default ImageItem;
