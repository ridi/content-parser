import { assert, should } from 'chai';

import Item from '../../src/model/Item';

should(); // Initialize should

describe('Model - Item', () => {
  it('Initialize test', () => {
    let item = new Item();
    assert(item.id === undefined);
    assert(item.href === undefined);
    assert(item.mediaType === undefined);
    assert(item.size === undefined);
    assert(item.isFileExists === false);

    item = new Item({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50
    });
    item.id.should.equal('Section0001.xhtml');
    item.href.should.equal('./Section0001.xhtml');
    item.mediaType.should.equal('application/xhtml+xml');
    item.size.should.equal(50);
    item.isFileExists.should.be.true;

    (() => {
      item.id = 'Section0002.xhtml';
      item.href = './Section0002.xhtml';
      item.mediaType = 'application/xhtml+xml';
      item.size = 59;
    }).should.throw(/read only property/gi);

    assert(item.defaultEncoding === undefined);
  });

  it('toRaw test', () => {
    let item = new Item({});
    item.toRaw().should.deep.equal({ id: undefined, href: undefined, mediaType: undefined, size: undefined, itemType: Item.name });

    item = new Item({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50
    });
    item.toRaw().should.deep.equal({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50, itemType: Item.name
    });
  });
});
