class Item {
  get isFileExists() { return this.size !== undefined; }

  constructor(rawObj = {}, freeze = true) {
    this.id = rawObj.id;
    this.href = rawObj.href;
    this.mediaType = rawObj.mediaType;
    this.size = rawObj.size;
    /* istanbul ignore else: untestable */
    if (freeze && this.constructor === Item) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return {
      id: this.id,
      href: this.href,
      mediaType: this.mediaType,
      size: this.size,
      itemType: Item.name,
    };
  }
}

export default Item;
