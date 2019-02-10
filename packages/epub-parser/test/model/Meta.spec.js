import { assert, should } from 'chai';

import Meta from '../../src/model/Meta';

should(); // Initialize should

describe('Model - Meta', () => {
  it('Initialize test', () => {
    let meta = new Meta();
    assert(meta.name === undefined);
    assert(meta.content === undefined);

    meta = new Meta({ name: 'Cover', content: './cover.png' });
    meta.name.should.equal('Cover');
    meta.content.should.equal('./cover.png');

    (() => {
      meta.name = 'Title';
      meta.content = './cover.xhtml';
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    let meta = new Meta({});
    meta.toRaw().should.deep.equal({ name: undefined, content: undefined });

    meta = new Meta({ name: 'Cover', content: './cover.png' });
    meta.toRaw().should.deep.equal({ name: 'Cover', content: './cover.png' });
  });
});
