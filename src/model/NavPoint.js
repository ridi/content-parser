class NavPoint {
  static get defaultProps() {
    return {
      depth: 0,
      children: [],
    };
  }

  get id() { return this._id; }

  get label() { return this._label; }

  get src() { return this._src; }

  get depth() { return this._depth || NavPoint.defaultProps.depth; }

  get children() { return this._children || NavPoint.defaultProps.children; }

  get spine() { return this._spine; }
}

export default NavPoint;
