import { assert, should } from 'chai';

import CssItem from '../../src/model/CssItem';
import InlineCssItem from '../../src/model/InlineCssItem';

should(); // Initialize should

describe('Model - InlineCssItem', () => {
  it('constructor test', () => {
    let item = new InlineCssItem({});
    assert(item.text === undefined);
    assert(item instanceof CssItem);

    item = new InlineCssItem({
      id: 'style.css_css_1', href: './style.css_css_1', mediaType: 'text/css', text: 'body { color: black; }', size: 22, namespace: 'css_1'
    });
    item.text.should.equal('body { color: black; }');

    (() => {
      item.text = '';
    }).should.throw(/read only property/gi);

    (() => {
      new InlineCssItem();
    }).should.throw(/cannot read property/gi);
  });

  it('toRaw test', () => {
    let item = new InlineCssItem({
      id: 'style.css_css_1', href: './style.css_css_1', mediaType: 'text/css', text: 'body { color: black; }', size: 22, namespace: 'css_1'
    });
    item.toRaw().should.deep.equal({
      id: 'style.css_css_1', href: './style.css_css_1', mediaType: 'text/css', text: 'body { color: black; }', size: 22, namespace: 'css_1', itemType: InlineCssItem.name
    });
  });
});
