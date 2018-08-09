import ImageItem from './ImageItem';

class CoverImageItem extends ImageItem {
  constructor(rawObj) {
    super(rawObj);
    Object.freeze(this);
  }
}

export default CoverImageItem;
