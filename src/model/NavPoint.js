class NavPoint {
  get id() { return this._id; }

  get label() { return this._label; }

  get src() { return this._src; }

  get children() { return this._children || []; }
}

export default NavPoint;
