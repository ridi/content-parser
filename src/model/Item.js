class Item {
  get id() { return this._id; }

  get herf() { return this._href; }

  get mediaType() { return this._mediaType; }

  get compressedSize() { return this._compressedSize; }

  get uncompressedSize() { return this._uncompressedSize; }

  get compressionMethod() { return this._compressionMethod; }

  get checkSum() { return this._checkSum || 0; }
}

export default Item;
