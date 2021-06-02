import { assert, should } from 'chai';

import ImageItem from '../../src/model/ImageItem';
import BaseEpubItem from '../../src/model/BaseEpubItem';

should(); // Initialize should

describe('Model - ImageItem', () => {
  it('Initialize test', () => {
    let item = new ImageItem();
    item.isCover.should.be.false;
    assert(item instanceof BaseEpubItem);

    item = new ImageItem({ id: 'cover.jpg', href: './cover.jpg', mediaType: 'image/jpeg', size: 105764, isCover: true });
    item.isCover.should.be.true;

    (() => {
      item.isCover = false;
    }).should.throw(/read only property/gi);

    assert(item.defaultEncoding === undefined);
  });

  it('toRaw test', () => {
    let item = new ImageItem({ id: 'cover.jpg', href: './cover.jpg', mediaType: 'image/jpeg', size: 105764, isCover: true });
    item.toRaw().should.deep.equal({
      id: 'cover.jpg', href: './cover.jpg', mediaType: 'image/jpeg', size: 105764, isCover: true, ItemType: 'ImageItem'
    });
  });
});
