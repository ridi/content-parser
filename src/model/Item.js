class Item {
  get isFileExists() { return this.size !== undefined; }

  constructor(rawObj) {
    this.id = rawObj.id;
    this.href = rawObj.href;
    this.mediaType = rawObj.mediaType;
    this.size = rawObj.size;
    if (this.constructor === Item) {
      Object.freeze(this);
    }
  }
}

export default Item;
