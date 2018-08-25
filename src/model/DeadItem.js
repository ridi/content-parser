import { mergeObjects } from '../utils';
import Item from './Item';

class DeadItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    this.reason = rawObj.reason || DeadItem.Reason.UNDEFINED;
    Object.freeze(this);
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      reason: this.reason,
      itemType: DeadItem.name,
    });
  }
}

DeadItem.Reason = Object.freeze({
  UNDEFINED: 'undefined',
  NOT_EXISTS: 'not_exists',
  NOT_SPINE: 'not_spine',
  NOT_NCX: 'not_ncx',
  NOT_SUPPORT_TYPE: 'not_support_type',
});

export default DeadItem;
