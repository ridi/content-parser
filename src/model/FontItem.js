import { mergeObjects } from '../utils';
import Item from './Item';

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
