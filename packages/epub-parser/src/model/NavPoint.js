import { mergeObjects } from '@ridi/parser-core';

/**
 * @typedef {Object} NavPointParam
 * @property {string} id
 * @property {{text:string}} navLabel
 * @property {{src: string}} content
 * @property {number} depth
 * @property {NavPoint} children
 * @property {string} spine
 */
class NavPoint {
  /**
   * @type {string}
   */
  id

  /**
   * @type {string}
   */
  label

  /**
   * @type {string}
   */
  src

  /**
   * @type {string}
   */
  anchor

  /**
   * @type {number}
   */
  depth

  /**
   * @type {NavPoint}
   */
  children

  /**
   * @type {string}
   */
  spine

  constructor(rawObj = {}, freeze = true) {
    this.id = rawObj.id;
    this.label = (rawObj.navLabel || {}).text;
    this.src = (rawObj.content || {}).src;
    this.anchor = ((src = '') => src.split('#')[1])(this.src);
    this.depth = rawObj.depth || 0;
    this.children
      = (rawObj.children || []).map(child => new NavPoint(mergeObjects(child, { depth: this.depth + 1 }), freeze));
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
