import Item from './Item';
import NavPoint from './NavPoint';
import { objectMerge } from '../utils';

class NcxItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    this.navPoints = (rawObj.navPoints || []).map((rawNavPoint) => { // eslint-disable-line arrow-body-style
      return new NavPoint(objectMerge(rawNavPoint, { findItem: rawObj.findItem }));
    });
    Object.freeze(this);
  }

  toRaw() {
    return objectMerge(super.toRaw(), {
      navPoints: this.navPoints.map(navPoint => navPoint.toRaw()),
      itemType: NcxItem.name,
    });
  }
}

export default NcxItem;
