class Item {
  static get defaultProps() {
    return {
      checkSum: 0,
      isFileExists: false,
    };
  }

  get id() { return this._id; }

  get href() { return this._href; }

  get mediaType() { return this._mediaType; }

  get compressedSize() { return this._compressedSize; }

  get uncompressedSize() { return this._uncompressedSize; }

  get compressionMethod() { return this._compressionMethod; }

  get checkSum() { return this._checkSum || Item.defaultProps.checkSum; }

  get isFileExists() { return this._isFileExists || Item.defaultProps.isFileExists; }
}

export default Item;
