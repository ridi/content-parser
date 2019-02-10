import { isExists, mergeObjects, stringContains } from '@ridi/parser-core';

import Item from './Item';

const Reason = Object.freeze({
  UNDEFINED: 'undefined',
  UNKNOWN: 'unknown',
  NOT_EXISTS: 'not_exists',
  NOT_SPINE: 'not_spine',
  NOT_NCX: 'not_ncx',
  NOT_SUPPORT_TYPE: 'not_support_type',
});

class DeadItem extends Item {
  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    if (isExists(rawObj.reason)) {
      if (stringContains(Object.values(Reason), rawObj.reason)) {
        this.reason = rawObj.reason.toLowerCase();
      } else {
        this.reason = Reason.UNKNOWN;
      }
    } else {
      this.reason = Reason.UNDEFINED;
    }
    /* istanbul ignore else */
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      reason: this.reason,
      itemType: DeadItem.name,
    });
  }
}

DeadItem.Reason = Reason;

export default DeadItem;
