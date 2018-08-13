import Item from './Item';

class ImageItem extends Item {
  get isCover() { return this._isCover || false; }

  constructor(rawObj) {
    super(rawObj);
    this._isCover = rawObj.isCover;
    Object.freeze(this);
  }
}

export default ImageItem;
