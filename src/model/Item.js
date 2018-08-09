class Item {
  constructor(rawObj) {
    this.id = rawObj.id;
    this.href = rawObj.href;
    this.mediaType = rawObj.mediaType;
    this.compressedSize = rawObj.compressedSize || 0;
    this.uncompressedSize = rawObj.uncompressedSize || 0;
    this.compressionMethod = rawObj.compressionMethod;
    this.checkSum = rawObj.checkSum || 0;
    if (this.constructor === Item) {
      Object.freeze(this);
    }
  }
}

export default Item;
