import Item from './Item';

class ImageItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    Object.freeze(this);
  }
}

export default ImageItem;
