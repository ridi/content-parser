import { objectMerge } from '../utils';

const privateProps = new WeakMap();

class NavPoint {
  get spine() { return privateProps.get(this).findItem(this.src); }

  constructor(rawObj) {
    this.id = rawObj.id;
    this.label = rawObj.label;
    this.src = rawObj.src;
    this.anchor = ((src = '') => src.split('#')[1])(this.src);
    this.depth = rawObj.depth || 0;
    this.children = (rawObj.children || []).map(o => new NavPoint(objectMerge(o, { depth: this.depth + 1 })));
    privateProps.set(this, rawObj.findItem);
    Object.freeze(this);
  }
}

export default NavPoint;
