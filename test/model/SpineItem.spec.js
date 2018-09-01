import { assert, should } from 'chai';

import Item from '../../src/model/Item';
import SpineItem from '../../src/model/SpineItem';

should(); // Initialize should

describe('Model - SpineItem', () => {
  it('constructor test', () => {
    let item = new SpineItem({});
    item.spineIndex.should.equal(SpineItem.UNKNOWN_INDEX);
    item.isLinear.should.be.true;
    assert(item.styles === undefined);
    assert(item instanceof Item);

    item = new SpineItem({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50, spineIndex: 5
    });
    item.spineIndex.should.equal(5);
    item.isLinear.should.be.true;
    assert(item.styles === undefined);

    item = new SpineItem({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50, isLinear: false, styles: [
        './Style0001.css', './Style0002.css'
      ]
    });
    assert(item.styles === undefined);

    const findItem = (href) => href;
    item = new SpineItem({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50, isLinear: false, styles: [
        './Style0001.css', './Style0002.css'
      ], findItem
    });
    item.spineIndex.should.equal(SpineItem.UNKNOWN_INDEX);
    item.isLinear.should.be.false;
    item.styles.should.have.lengthOf(2);
    item.styles[1].should.equal('./Style0002.css');

    (() => {
      item.spineIndex = 100;
      item.isLinear = true;
      item.styles = [];
    }).should.throw(/read only property/gi);

    (() => {
      new SpineItem();
    }).should.throw(/cannot read property/gi);
  });

  it('toRaw test', () => {
    let item = new SpineItem({});
    let rawItem = item.toRaw();
    rawItem.spineIndex.should.equal(SpineItem.UNKNOWN_INDEX);
    rawItem.isLinear.should.be.true;
    assert(rawItem.styles === undefined);

    item = new SpineItem({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50, spineIndex: 5
    });
    rawItem = item.toRaw();
    rawItem.spineIndex.should.equal(5);
    rawItem.isLinear.should.be.true;
    assert(rawItem.styles === undefined);

    const findItem = (href) => href;
    item = new SpineItem({
      id: 'Section0001.xhtml', href: './Section0001.xhtml', mediaType: 'application/xhtml+xml', size: 50, isLinear: false, styles: [
        './Style0001.css', './Style0002.css'
      ], findItem
    });
    rawItem = item.toRaw();
    rawItem.spineIndex.should.equal(SpineItem.UNKNOWN_INDEX);
    rawItem.isLinear.should.be.false;
    rawItem.styles.should.deep.equal(['./Style0001.css', './Style0002.css']);
  });
});
