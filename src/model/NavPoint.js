import { isExists } from '../util/typecheck';
import mergeObjects from '../util/mergeObjects';

const privateProps = new WeakMap();

class NavPoint {
  get spine() {
    const { findItem } = privateProps.get(this);
    if (!isExists(findItem)) {
      return undefined;
    }
    return findItem(this.src);
  }

  constructor(rawObj) {
    this.id = rawObj.id;
    this.label = (rawObj.navLabel || {}).text;
    this.src = (rawObj.content || {}).src;
    this.anchor = ((src = '') => src.split('#')[1])(this.src);
    this.depth = rawObj.depth || 0;
    this.children = (rawObj.children || []).map(child => new NavPoint(mergeObjects(child, { depth: this.depth + 1 })));
    privateProps.set(this, { findItem: rawObj.findItem });
    Object.freeze(this);
  }

  toRaw() {
    return {
      id: this.id,
      navLabel: {
        text: this.label,
      },
      content: {
        src: this.src,
      },
      children: this.children.map(child => child.toRaw()),
    };
  }
}

export default NavPoint;
