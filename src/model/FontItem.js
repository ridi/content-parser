import Item from './Item';
import { mergeObjects } from '../utils';

class FontItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    Object.freeze(this);
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      itemType: FontItem.name,
    });
  }
}

export default FontItem;
