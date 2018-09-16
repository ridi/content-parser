import ImageItem from './ImageItem';
import mergeObjects from '../util/mergeObjects';

class SvgItem extends ImageItem {
  constructor(rawObj = {}, freeze = true) /* istanbul ignore next: untestable */ {
    const _ = super(rawObj, freeze); // eslint-disable-line
    /* istanbul ignore else: untestable */
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      itemType: SvgItem.name,
    });
  }
}

export default SvgItem;
