import Item from './Item';
import { getPropertyKeys, isExists, objectMerge } from '../utils';

class DeadItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    if (isExists(rawObj.raw)) {
      this.raw = rawObj.raw;
    } else {
      this.raw = {};
      getPropertyKeys(rawObj).forEach((key) => {
        if (!isExists(this[key])) {
          this.raw[key] = rawObj[key];
        }
      });
    }
    Object.freeze(this);
  }

  toRaw() {
    return objectMerge(super.toRaw(), {
      raw: this.raw,
      itemType: DeadItem.name,
    });
  }
}

export default DeadItem;
