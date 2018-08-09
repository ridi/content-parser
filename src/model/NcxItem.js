import Item from './Item';
import NavPoint from './NavPoint';

class NcxItem extends Item {
  constructor(rawObj) {
    super(rawObj);
    this.navPoints = (rawObj.navPoints || []).map(ro => new NavPoint(ro));
    Object.freeze(this);
  }
}

export default NcxItem;
