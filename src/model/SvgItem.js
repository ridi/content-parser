import ImageItem from './ImageItem';
import mergeObjects from '../util/mergeObjects';

class SvgItem extends ImageItem {
  constructor(rawObj) {
    super(rawObj);
    Object.freeze(this);
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      itemType: SvgItem.name,
    });
  }
}

export default SvgItem;
