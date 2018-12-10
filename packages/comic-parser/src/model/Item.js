class Item {
  constructor(rawObj = {}, freeze = true) {
    this.index = rawObj.index;
    this.path = rawObj.path;
    this.size = rawObj.size;
    /* istanbul ignore else: untestable */
    if (freeze && this.constructor === Item) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return {
      index: this.index,
      path: this.path,
      size: this.size,
    };
  }
}

export default Item;
