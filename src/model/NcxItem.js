import Item from './Item';

class NcxItem extends Item {
  get nvaPoints() { return this._nvaPoints || []; }
}

export default NcxItem;
