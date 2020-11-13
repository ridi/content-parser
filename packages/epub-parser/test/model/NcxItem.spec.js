import { assert, should } from 'chai';

import BaseEpubItem from '../../src/model/BaseEpubItem';
import NcxItem from '../../src/model/NcxItem';

should(); // Initialize should

describe('Model - NcxItem', () => {
  it('Initialize test', () => {
    let item = new NcxItem();
    item.navPoints.should.have.lengthOf(0);
    assert(item instanceof BaseEpubItem);

    item = new NcxItem({ navPoints: [{ id: 'c1' }, { id: 'c2' }] });
    item.navPoints.should.have.lengthOf(2);

    (() => {
      item.navPoints = [];
    }).should.throw(/read only property/gi);

    assert(item.defaultEncoding === 'utf8');
  });

  it('toRaw test', () => {
    const item = new NcxItem({ navPoints: [{ id: 'c1' }, { id: 'c2' }] });
    const rawItem = item.toRaw();
    rawItem.navPoints.should.have.lengthOf(2);
    rawItem.itemType.should.equal('NcxItem');
  });
});
