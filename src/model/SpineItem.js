import Item from './Item';

class SpineItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    this.spineIndex = rawObj.spineIndex || SpineItem.UNKNOWN_INDEX;
    this.isLinear = rawObj.isLinear;
    Object.freeze(this);
  }
}

SpineItem.UNKNOWN_INDEX = -1;

export default SpineItem;
