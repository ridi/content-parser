import Item from './Item';

class NcxItem extends Item {
  static get defaultProps() {
    return Object.assign({}, Item.defaultProps, { navPoints: [] });
  }

  get navPoints() { return this._navPoints || NcxItem.defaultProps.navPoints; }
}

export default NcxItem;
