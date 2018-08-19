import Item from './Item';
import { getPropertyKeys, isExists } from '../utils';

class DeadItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    this.raw = {};
    getPropertyKeys(rawObj).forEach((key) => {
      if (!isExists(this[key])) {
        this.raw[key] = rawObj[key];
      }
    });
    Object.freeze(this);
  }
}

export default DeadItem;
