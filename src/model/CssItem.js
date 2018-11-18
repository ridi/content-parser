import { isExists } from '../util/typecheck';
import Item from './Item';
import mergeObjects from '../util/mergeObjects';

class CssItem extends Item {
  get defaultEncoding() { return 'utf8'; }

  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    if (isExists(rawObj.namespace)) {
      this.namespace = rawObj.namespace;
    }
    /* istanbul ignore else: untestable */
    if (freeze && this.constructor === CssItem) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      namespace: this.namespace,
      itemType: CssItem.name,
    });
  }
}

export default CssItem;
