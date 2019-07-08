import { assert, should } from 'chai';

import Item from '../../src/model/Item';

should(); // Initialize should

describe('Model - Item', () => {
  it('Initialize test', () => {
    let item = new Item();
    assert(item.pageId === undefined);

    item = new Item({ pageId: 0 });
    item.pageId.should.equal(0);

    (() => {
      item.pageId = 1;
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    let item = new Item({});
    item.toRaw().should.deep.equal({});

    item = new Item({ pageId: 0 });
    item.toRaw().should.deep.equal({ pageId: 0 });
  });
});
