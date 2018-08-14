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
}

export default NcxItem;
