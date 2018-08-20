import Item from './Item';
import { isExists, mergeObjects } from '../utils';

class DeadItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    if (isExists(rawObj.raw)) {
      this.raw = rawObj.raw;
    } else {
      this.raw = {};
      Object.keys(rawObj).forEach((key) => {
        if (!isExists(this[key])) {
          this.raw[key] = rawObj[key];
        }
      });
    }
    Object.freeze(this);
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      raw: this.raw,
      itemType: DeadItem.name,
    });
  }
}

export default DeadItem;
