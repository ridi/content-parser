import { assert, should } from 'chai';

import CssItem from '../../src/model/CssItem';
import InlineCssItem from '../../src/model/InlineCssItem';

should(); // Initialize should

describe('Model - InlineCssItem', () => {
  it('Initialize test', () => {
    let item = new InlineCssItem();
    assert(item.style === '');
    assert(item instanceof CssItem);

    item = new InlineCssItem({
      id: 'style.css_css_1', href: './style.css_css_1', mediaType: 'text/css', style: 'body { color: black; }', size: 22, namespace: 'css_1'
    });
    item.style.should.equal('body { color: black; }');

    (() => {
      item.style = '';
    }).should.throw(/read only property/gi);

    assert(item.defaultEncoding === 'utf8');
  });

  it('toRaw test', () => {
    let item = new InlineCssItem({
      id: 'style.css_css_1', href: './style.css_css_1', mediaType: 'text/css', style: 'body { color: black; }', size: 22, namespace: 'css_1'
    });
    item.toRaw().should.deep.equal({
      id: 'style.css_css_1', href: './style.css_css_1', mediaType: 'text/css', style: 'body { color: black; }', size: 22, namespace: 'css_1', itemType: 'InlineCssItem'
    });
  });
});
