import CssItem from './CssItem';

class InlineCssItem extends CssItem {
  constructor(rawObj) {
    super(rawObj);
    this.text = rawObj.text;
    Object.freeze(this);
  }
}

export default InlineCssItem;
