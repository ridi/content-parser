import Item from './Item';

class SpineItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    this.spineIndex = rawObj.spineIndex;
    this.isLinear = rawObj.isLinear;
    Object.freeze(this);
  }
}

export default SpineItem;
