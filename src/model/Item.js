class Item {
  get isFileExists() { return this.compressedSize !== undefined && this.uncompressedSize !== undefined; }

  constructor(rawObj) {
    this.id = rawObj.id;
    this.href = rawObj.href;
    this.mediaType = rawObj.mediaType;
    this.compressedSize = rawObj.compressedSize;
    this.uncompressedSize = rawObj.uncompressedSize;
    if (this.constructor === Item) {
      Object.freeze(this);
    }
  }
}

export default Item;
