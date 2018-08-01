class NavPoint {
  static get defaultProps() {
    return { children: [] };
  }

  get id() { return this._id; }

  get label() { return this._label; }

  get src() { return this._src; }

  get children() { return this._children || NavPoint.defaultProps.children; }
}

export default NavPoint;
