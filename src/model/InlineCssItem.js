import CssItem from './CssItem';
import mergeObjects from '../util/mergeObjects';

class InlineCssItem extends CssItem {
  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    this.text = rawObj.text || '';
    /* istanbul ignore else: untestable */
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      text: this.text,
      itemType: InlineCssItem.name,
    });
  }
}

export default InlineCssItem;
