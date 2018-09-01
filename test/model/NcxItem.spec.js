import { assert, should } from 'chai';

import Item from '../../src/model/Item';
import NcxItem from '../../src/model/NcxItem';

should(); // Initialize should

describe('Model - NcxItem', () => {
  it('constructor test', () => {
    let item = new NcxItem({});
    item.navPoints.should.have.lengthOf(0);
    assert(item instanceof Item);

    item = new NcxItem({ navPoints: [{ id: 'c1' }, { id: 'c2' }] });
    item.navPoints.should.have.lengthOf(2);

    (() => {
      item.navPoints = [];
    }).should.throw(/read only property/gi);

    (() => {
      new NcxItem();
    }).should.throw(/cannot read property/gi);
  });

  it('toRaw test', () => {
    const item = new NcxItem({ navPoints: [{ id: 'c1' }, { id: 'c2' }] });
    const rawItem = item.toRaw();
    rawItem.navPoints.should.have.lengthOf(2);
    rawItem.itemType.should.equal(NcxItem.name);
  });
});
