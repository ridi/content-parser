import { assert, should } from 'chai';

import { isArray } from '../../src/util';
import NavPoint from '../../src/model/NavPoint';
import SpineItem from '../../src/model/SpineItem';

should(); // Initialize should

describe('Model - NavPoint', () => {
  it('constructor test', () => {
    let navPoint = new NavPoint();
    assert(navPoint.id === undefined);
    assert(navPoint.label === undefined);
    assert(navPoint.src === undefined);
    assert(navPoint.anchor === undefined);
    assert(navPoint.depth === 0);
    assert(isArray(navPoint.children));
    assert(navPoint.spine === undefined);

    navPoint = new NavPoint({
      id: 'p1', navLabel: { text: '1.' }, content: { src: './Section0001.xhtml' }, children: [
        { id: 'p2', navLabel: { text: '1.1.' }, content: { src: './Section0001.xhtml#1_1' }, anchor: '1_2', depth: 5 },
        { id: 'p3' }
      ]
    });
    navPoint.id.should.equal('p1');
    navPoint.label.should.equal('1.');
    navPoint.src.should.equal('./Section0001.xhtml');
    assert(navPoint.anchor === undefined);
    navPoint.depth.should.equal(0);
    navPoint.children.should.have.lengthOf(2);
    assert(navPoint.spine === undefined);

    let child = navPoint.children[0];
    child.id.should.equal('p2');
    child.label.should.equal('1.1.');
    child.src.should.equal('./Section0001.xhtml#1_1');
    child.anchor.should.equal('1_1');
    child.depth.should.equal(1);
    child.children.should.have.lengthOf(0);
    assert(child.spine === undefined);

    child = navPoint.children[1];
    child.id.should.equal('p3');
    assert(child.label === undefined);
    assert(child.src === undefined);
    assert(child.anchor === undefined);
    assert(child.depth === 1);
    child.children.should.have.lengthOf(0);
    assert(child.spine === undefined);

    (() => {
      navPoint.id = 'c1';
      navPoint.label = 'Chapter 1';
      navPoint.src = './Section0001.xhtml#1';
      navPoint.anchor = '1';
      navPoint.depth = 1;
      navPoint.children = [];
      navPoint.spine = new SpineItem({});
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    const navPoint = new NavPoint({
      id: 'p1', navLabel: { text: '1.' }, content: { src: './Section0001.xhtml' }, children: [
        { id: 'p2', navLabel: { text: '1.1.' }, content: { src: './Section0001.xhtml#1_1' }, anchor: '1_2', depth: 5 },
        { id: 'p3' }
      ]
    });
    navPoint.toRaw().should.deep.equal({
      id: 'p1', navLabel: { text: '1.' }, content: { src: './Section0001.xhtml' }, children: [
        { id: 'p2', navLabel: { text: '1.1.' }, content: { src: './Section0001.xhtml#1_1' }, children: [] },
        { id: 'p3', navLabel: { text: undefined }, content: { src: undefined }, children: [] }
      ]
    });
  });
});
