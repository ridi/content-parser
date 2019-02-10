import { assert, should } from 'chai';

import Guide from '../../src/model/Guide';
import Item from '../../src/model/Item';

should(); // Initialize should

describe('Model - Guide', () => {
  it('Initialize test', () => {
    let guide = new Guide();
    assert(guide.title === undefined);
    assert(guide.type === Guide.Types.UNDEFINED);
    assert(guide.href === undefined);
    assert(guide.item === undefined);

    guide = new Guide({ title: 'Cover', type: 'coVer', href: './cover.xhtml' });
    guide.title.should.equal('Cover');
    guide.type.should.equal(Guide.Types.COVER);
    guide.href.should.equal('./cover.xhtml');
    assert(guide.item === undefined);

    guide = new Guide({ title: 'Cover', type: 'Invalid type', href: './cover.xhtml' });
    guide.title.should.equal('Cover');
    guide.type.should.equal(Guide.Types.UNKNOWN);
    guide.href.should.equal('./cover.xhtml');
    assert(guide.item === undefined);

    (() => {
      guide.title = 'Title';
      guide.type = Guide.Types.TITLE_PAGE;
      guide.href = './title.xhtml';
      guide.item = new Item({});
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    let guide = new Guide({});
    guide.toRaw().should.deep.equal({ title: undefined, type: Guide.Types.UNDEFINED, href: undefined });

    guide = new Guide({ title: 'Cover', type: 'coVer', href: './cover.xhtml' });
    guide.toRaw().should.deep.equal({ title: 'Cover', type: Guide.Types.COVER, href: './cover.xhtml' });

    guide = new Guide({ title: 'Cover', type: 'Invalid type', href: './cover.xhtml' });
    guide.toRaw().should.deep.equal({ title: 'Cover', type: Guide.Types.UNKNOWN, href: './cover.xhtml' });
  });
});
