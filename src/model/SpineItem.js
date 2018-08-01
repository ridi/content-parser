import Item from './Item';

class SpineItem extends Item {
  static get defaultProps() {
    return Object.assign({}, Item.defaultProps, { isLinear: false });
  }

  get isLinear() { return this._isLinear || SpineItem.defaultProps.isLinear; }
}

export default SpineItem;
