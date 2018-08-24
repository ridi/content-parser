import { mergeObjects } from '../utils';
import Item from './Item';
import NavPoint from './NavPoint';

class NcxItem extends Item {
  get defaultEncoding() { return 'utf8'; }

  constructor(rawObj) {
    super(rawObj);
    this.navPoints = (rawObj.navPoints || []).map((rawNavPoint) => { // eslint-disable-line arrow-body-style
      return new NavPoint(mergeObjects(rawNavPoint, { findItem: rawObj.findItem }));
    });
    Object.freeze(this);
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      navPoints: this.navPoints.map(navPoint => navPoint.toRaw()),
      itemType: NcxItem.name,
    });
  }
}

export default NcxItem;
