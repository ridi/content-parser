import Item from './Item';
import { isExists, objectMerge } from '../utils';

class CssItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    if (isExists(rawObj.namespace)) {
      this.namespace = rawObj.namespace;
    }
    if (this.constructor === CssItem) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return objectMerge(super.toRaw(), {
      namespace: this.namespace,
      itemType: CssItem.name,
    });
  }
}

export default CssItem;
