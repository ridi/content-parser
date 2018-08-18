import Item from './Item';
import { isExists } from '../utils';

const privateProps = new WeakMap();

class SpineItem extends Item {
  get styles() {
    const { findItem, styles } = privateProps.get(this);
    if (!isExists(styles)) {
      return undefined;
    }
    return styles.map(style => findItem(style));
  }

  constructor(rawObj) {
    super(rawObj);
    this.spineIndex = isExists(rawObj.spineIndex) ? rawObj.spineIndex : SpineItem.UNKNOWN_INDEX;
    this.isLinear = isExists(rawObj.isLinear) ? rawObj.isLinear : true;
    if (isExists(rawObj.styles)) {
      privateProps.set(this, { findItem: rawObj.findItem, styles: rawObj.styles });
    }
    Object.freeze(this);
  }
}

SpineItem.UNKNOWN_INDEX = -1;

export default SpineItem;
