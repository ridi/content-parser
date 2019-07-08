class Item {
  constructor(rawObj = {}, freeze = true) {
    // TODO
    Object.assign(this, rawObj);
    /* istanbul ignore else */
    if (freeze && this.constructor === Item) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return Object.assign({}, this);
  }
}

export default Item;
