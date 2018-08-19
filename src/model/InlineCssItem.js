import CssItem from './CssItem';
import { objectMerge } from '../utils';

class InlineCssItem extends CssItem {
  constructor(rawObj) {
    super(rawObj);
    this.text = rawObj.text;
    Object.freeze(this);
  }

  toRaw() {
    return objectMerge(super.toRaw(), {
      text: this.text,
      itemType: InlineCssItem.name,
    });
  }
}

export default InlineCssItem;
