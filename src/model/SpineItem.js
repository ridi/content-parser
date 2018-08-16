import Item from './Item';
import { isExists } from '../utils';

class SpineItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    this.spineIndex = isExists(rawObj.spineIndex) ? rawObj.spineIndex : SpineItem.UNKNOWN_INDEX;
    this.isLinear = isExists(rawObj.isLinear) ? rawObj.isLinear : true;
    Object.freeze(this);
  }
}

SpineItem.UNKNOWN_INDEX = -1;

export default SpineItem;
