import { assert, should } from 'chai';

import ImageItem from '../../src/model/ImageItem';
import SvgItem from '../../src/model/SvgItem';

should(); // Initialize should

describe('Model - SvgItem', () => {
  it('constructor test', () => {
    const item = new SvgItem();
    assert(item instanceof ImageItem);
  });

  it('toRaw test', () => {
    const item = new SvgItem({ id: 'bg.svg', href: './bg.svg', mediaType: 'image/svg+xml', size: 321, isCover: false });
    item.toRaw().should.deep.equal({
      id: 'bg.svg', href: './bg.svg', mediaType: 'image/svg+xml', size: 321, isCover: false, itemType: SvgItem.name
    });
  });
});
