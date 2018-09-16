import { isExists } from '../util/typecheck';
import Item from './Item';
import mergeObjects from '../util/mergeObjects';

const ignoredIndex = -1;

class SpineItem extends Item {
  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    this.spineIndex = isExists(rawObj.spineIndex) ? rawObj.spineIndex : ignoredIndex;
    this.isLinear = isExists(rawObj.isLinear) ? rawObj.isLinear : true;
    if (isExists(rawObj.styles)) {
      this.styles = rawObj.styles;
    }
    this.prev = undefined;
    this.next = undefined;
    /* istanbul ignore else: untestable */
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    let rawObject = mergeObjects(super.toRaw(), {
      spineIndex: this.spineIndex,
      isLinear: this.isLinear,
      itemType: SpineItem.name,
    });
    if (isExists(this.styles)) {
      rawObject = mergeObjects(rawObject, {
        styles: this.styles.map(style => style.href),
      });
    }
    return rawObject;
  }
}

SpineItem.IGNORED_INDEX = ignoredIndex;

export default SpineItem;
