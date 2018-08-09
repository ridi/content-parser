class NavPoint {
  constructor(rawObj) {
    this.id = rawObj.id;
    this.label = rawObj.label;
    this.src = rawObj.src;
    this.anchor = ((src = '') => src.split('#')[1])(this.src);
    this.depth = rawObj.depth || 0;
    this.children = rawObj.children || [];
    this.spine = rawObj.spine;
    Object.freeze(this);
  }
}

export default NavPoint;
