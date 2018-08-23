class Item {
  get isFileExists() { return this.size !== undefined; }

  get defaultEncoding() { return undefined; }

  constructor(rawObj) {
    this.id = rawObj.id;
    this.href = rawObj.href;
    this.mediaType = rawObj.mediaType;
    this.size = rawObj.size;
    if (this.constructor === Item) {
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
