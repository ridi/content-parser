import Item from './Item';
import { objectMerge } from '../utils';

class FontItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    Object.freeze(this);
  }

  toRaw() {
    return objectMerge(super.toRaw(), {
      itemType: FontItem.name,
    });
  }
}

export default FontItem;
