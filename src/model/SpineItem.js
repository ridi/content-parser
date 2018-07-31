import Item from './Item';

class SpineItem extends Item {
  get isLinear() { return this._isLinear || false; }
}

export default SpineItem;
