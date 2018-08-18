import Item from './Item';
import { isExists } from '../utils';

class CssItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    if (isExists(rawObj.namespace)) {
      this.namespace = rawObj.namespace;
    }
    Object.freeze(this);
  }
}

export default CssItem;
