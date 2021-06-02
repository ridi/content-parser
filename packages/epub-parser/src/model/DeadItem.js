import { isExists, mergeObjects, stringContains } from '@ridi/parser-core';

import BaseEpubItem from './BaseEpubItem';

const Reason = Object.freeze({
  UNDEFINED: 'undefined',
  UNKNOWN: 'unknown',
  NOT_EXISTS: 'not_exists',
  NOT_SPINE: 'not_spine',
  NOT_NCX: 'not_ncx',
  NOT_SUPPORT_TYPE: 'not_support_type',
});

class DeadItem extends BaseEpubItem {
  /**
   * @type {string}
   */
  reason;

  /**
   * @type {string}
   */
   ItemType;

   /**
   * @typedef {Object} DeadItemExtra
   * @property {string} [reason]
   * @property {string} [ItemType]
   *
   * @typedef {import('./BaseEpubItem').BaseEpubItemParam & DeadItemExtra} DeadItemParam
   */

   /**
   *
   * @param {DeadItemParam} rawObj
   * @param {boolean} freeze
   */
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
       ItemType: 'DeadItem',
     });
   }
}

DeadItem.Reason = Reason;

export default DeadItem;
