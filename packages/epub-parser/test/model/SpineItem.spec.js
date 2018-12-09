import { assert, should } from 'chai';

import Item from '../../src/model/Item';
import SpineItem from '../../src/model/SpineItem';

should(); // Initialize should

describe('Model - SpineItem', () => {
  it('constructor test', () => {
    let item = new SpineItem();
    item.index.should.equal(SpineItem.IGNORED_INDEX);
    item.isLinear.should.be.true;
    assert(item.first() === undefined);
    assert(item.prev() === undefined);
    assert(item.next() === undefined);
    assert(item.styles === undefined);
    assert(item instanceof Item);

    item = new SpineItem({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50, index: 5
    });
    item.index.should.equal(5);
    item.isLinear.should.be.true;
    assert(item.styles === undefined);

    const styles = ['./Style0001.css', './Style0002.css'];
    item = new SpineItem({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50, isLinear: false, styles,
    });
    item.styles.should.deep.equal(styles);

    (() => {
      item.index = 100;
      item.isLinear = true;
      item.styles = [];
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    let item = new SpineItem({});
    let rawItem = item.toRaw();
    rawItem.index.should.equal(SpineItem.IGNORED_INDEX);
    rawItem.isLinear.should.be.true;
    assert(rawItem.styles === undefined);

    item = new SpineItem({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50, index: 5
    });
    rawItem = item.toRaw();
    rawItem.index.should.equal(5);
    rawItem.isLinear.should.be.true;
    assert(rawItem.styles === undefined);

    const styles = [{ href: './Style0001.css' }, { href: './Style0002.css' }];
    item = new SpineItem({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50, isLinear: false, styles: styles,
    });
    rawItem = item.toRaw();
    rawItem.index.should.equal(SpineItem.IGNORED_INDEX);
    rawItem.isLinear.should.be.false;
    rawItem.styles.should.deep.equal(['./Style0001.css', './Style0002.css']);
  });
});
