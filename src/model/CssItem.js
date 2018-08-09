import Item from './Item';

class CssItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    Object.freeze(this);
  }
}

export default CssItem;
