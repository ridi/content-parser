import { assert, should } from 'chai';

import Item from '../../src/model/Item';

should(); // Initialize should

describe('Model - Item', () => {
  it('Initialize test', () => {
    let item = new Item();
    assert(item.index === undefined);
    assert(item.path === undefined);
    assert(item.size === undefined);
    assert(item.width === undefined);
    assert(item.height === undefined);

    item = new Item({
      index: 0, path: '0.png', size: 12345, width: 20, height: 20
    });
    item.index.should.equal(0);
    item.path.should.equal('0.png');
    item.size.should.equal(12345);
    item.width.should.equal(20);
    item.height.should.equal(20);

    (() => {
      item.index = 1;
      item.path = '1.png';
      item.size = 54321;
      item.width = 10;
      item.height = 10;
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
      index: 0, path: '0.png', size: 12345, width: 20, height: 20
    });
    item.toRaw().should.deep.equal({
      index: 0, path: '0.png', size: 12345, width: 20, height: 20
    });
  });
});
