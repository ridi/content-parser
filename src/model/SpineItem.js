import Item from './Item';

class SpineItem extends Item {
  static UNKNOWN_INDEX = -1

  constructor(rawObj) {
    super(rawObj);
    this.spineIndex = rawObj.spineIndex || SpineItem.UNKNOWN_INDEX;
    this.isLinear = rawObj.isLinear;
    Object.freeze(this);
  }
}

export default SpineItem;
