import { assert, should } from 'chai';

import Item from '../../src/model/Item';

should(); // Initialize should

describe('Model - Item', () => {
  it('constructor test', () => {
    let item = new Item();
    assert(item.index === undefined);
    assert(item.path === undefined);
    assert(item.size === undefined);

    item = new Item({
      index: 0, path: '0.png', size: 12345
    });
    item.index.should.equal(0);
    item.path.should.equal('0.png');
    item.size.should.equal(12345);

    (() => {
      item.index = 1;
      item.path = '1.png';
      item.size = 54321;
    }).should.throw(/read only property/gi);
  });

  it('mimeType test', () => {
    new Item({ path: 'img.jPg' }).mimeType.should.equal('image/jpg');
    new Item({ path: 'img.unsupportType' }).mimeType.should.equal('');
  });

  it('toRaw test', () => {
    let item = new Item({});
    item.toRaw().should.deep.equal({ index: undefined, path: undefined, size: undefined });

    item = new Item({
      index: 0, path: '0.png', size: 12345
    });
    item.toRaw().should.deep.equal({
      index: 0, path: '0.png', size: 12345
    });
  });
});
