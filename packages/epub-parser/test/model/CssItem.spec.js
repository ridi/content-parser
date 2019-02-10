import { assert, should } from 'chai';

import CssItem from '../../src/model/CssItem';
import Item from '../../src/model/Item';

should(); // Initialize should

describe('Model - CssItem', () => {
  it('Initialize test', () => {
    let item = new CssItem();
    assert(item.namespace === undefined);
    assert(item instanceof Item);

    item = new CssItem({ id: 'style.css', href: './style.css', mediaType: 'text/css', size: 15, namespace: 'css_1' });
    item.namespace.should.equal('css_1');

    (() => {
      item.namespace = 'css_2';
    }).should.throw(/read only property/gi);

    assert(item.defaultEncoding === 'utf8');
  });

  it('toRaw test', () => {
    let item = new CssItem({ id: 'style.css', href: './style.css', mediaType: 'text/css', size: 15, namespace: 'css_1' });
    item.toRaw().should.deep.equal({
      id: 'style.css', href: './style.css', mediaType: 'text/css', size: 15, namespace: 'css_1', itemType: CssItem.name
    });
  });
});
