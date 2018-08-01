import Item from './Item';

class SpineItem extends Item {
  static get defaultProps() {
    return Object.assign({}, Item.defaultProps, {
      spineIndex: -1,
      isLinear: false,
    });
  }

  get spineIndex() { return this._spineIndex || SpineItem.defaultProps.spineIndex; }

  get isLinear() { return this._isLinear || SpineItem.defaultProps.isLinear; }
}

export default SpineItem;
