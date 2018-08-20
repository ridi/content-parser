import CssItem from './CssItem';
import { mergeObjects } from '../utils';

class InlineCssItem extends CssItem {
  constructor(rawObj) {
    super(rawObj);
    this.text = rawObj.text;
    Object.freeze(this);
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      text: this.text,
      itemType: InlineCssItem.name,
    });
  }
}

export default InlineCssItem;
