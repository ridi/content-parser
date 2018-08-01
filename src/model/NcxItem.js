import Item from './Item';

class NcxItem extends Item {
  static get defaultProps() {
    return Object.assign({}, Item.defaultProps, { nvaPoints: [] });
  }

  get nvaPoints() { return this._nvaPoints || NcxItem.defaultProps.nvaPoints; }
}

export default NcxItem;
