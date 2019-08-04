import { isArray } from '@ridi/parser-core';
import { assert, should } from 'chai';

import OutlineItem from '../../src/model/OutlineItem';

should(); // Initialize should

describe('Model - OutlineItem', () => {
  it('Initialize test', () => {
    let outlineItem = new OutlineItem();
    assert(outlineItem.dest === undefined);
    assert(outlineItem.url === undefined);
    assert(outlineItem.title === '');
    outlineItem.color.toRaw().should.deep.equal({ 0: 0, 1: 0, 2: 0 });
    assert(outlineItem.bold === false);
    assert(outlineItem.italic === false);
    assert(outlineItem.depth === 0);
    assert(isArray(outlineItem.children));
    assert(outlineItem.page === undefined);

    const dest = [{ num: 5, gen: 0 }];
    outlineItem = new OutlineItem({
      dest,
      title: 'Chapter 1.',
      depth: 0,
      items: [],
    });
    outlineItem.dest.should.deep.equal(dest);
    assert(outlineItem.page === undefined);

    outlineItem = new OutlineItem({
      dest: 'chapter-1',
      title: 'Chapter 1.',
      depth: 2,
      items: [
        {
          dest: 'chapter-1.1',
          title: 'Chapter 1.1.',
          items: [{
            dest: 'chapter-1.1.1',
            title: 'Chapter 1.1.1.',
            items: []
          }]
        },
        {
          dest: 'chapter-1.2',
          title: 'Chapter 1.2.',
          items: []
        }
      ]
    });
    outlineItem.dest.should.equal('chapter-1');
    outlineItem.title.should.equal('Chapter 1.');
    outlineItem.depth.should.equal(2);
    outlineItem.children.should.have.lengthOf(2);
    assert(outlineItem.page === undefined);

    let child = outlineItem.children[0];
    child.dest.should.equal('chapter-1.1');
    child.title.should.equal('Chapter 1.1.');
    child.depth.should.equal(3);
    child.children.should.have.lengthOf(1);
    assert(outlineItem.page === undefined);

    child = outlineItem.children[1];
    child.dest.should.equal('chapter-1.2');
    child.title.should.equal('Chapter 1.2.');
    child.depth.should.equal(3);
    child.children.should.have.lengthOf(0);
    assert(outlineItem.page === undefined);

    (() => {
      outlineItem.dest = 'chapter-2';
      outlineItem.url = 'https://ridibooks.com';
      outlineItem.title = 'Chapter 2.';
      outlineItem.color = [255, 255, 255];
      outlineItem.bold = true;
      outlineItem.italic = true;
      outlineItem.depth = 1;
      outlineItem.children = [];
      outlineItem.page = 5;
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    const outlineItem = new OutlineItem({
      dest: 'chapter-1',
      title: 'Chapter 1.',
      bold: true,
      italic: true,
      items: [
        {
          dest: 'chapter-1.1',
          title: 'Chapter 1.1.',
          color: { 0: 255, 1: 255, 2: 255 },
          items: [],
          page: 6,
        }
      ],
      page: 5,
    });
    outlineItem.toRaw().should.deep.equal({
      dest: 'chapter-1',
      url: undefined,
      title: 'Chapter 1.',
      color: { 0: 0, 1: 0, 2: 0 },
      bold: true,
      italic: true,
      children: [
        {
          dest: 'chapter-1.1',
          url: undefined,
          title: 'Chapter 1.1.',
          color: { 0: 255, 1: 255, 2: 255 },
          bold: false,
          italic: false,
          children: [],
          page: 6,
        }
      ],
      page: 5,
    });
  });
});
