import Item from './Item';

class FontItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    Object.freeze(this);
  }
}

export default FontItem;
