import { mergeObjects } from '../util';
import ImageItem from './ImageItem';

class SvgItem extends ImageItem {
  get defaultEncoding() { return 'utf8'; }

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
