import { mergeObjects } from '@ridi/parser-core';

class NavPoint {
  constructor(rawObj = {}, freeze = true) {
    this.id = rawObj.id;
    this.label = (rawObj.navLabel || {}).text;
    this.src = (rawObj.content || {}).src;
    this.anchor = ((src = '') => src.split('#')[1])(this.src);
    this.depth = rawObj.depth || 0;
    this.children = (rawObj.children || []).map((child) => {
      return new NavPoint(mergeObjects(child, { depth: this.depth + 1 }), freeze);
    });
    this.spine = undefined;
    /* istanbul ignore else */
    if (freeze) {
      Object.freeze(this);
    }
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
