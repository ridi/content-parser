import { assert, should } from 'chai';

import Color from '../../src/model/Color';

should(); // Initialize should

describe('Model - Color', () => {
  it('Initialize test', () => {
    let color = new Color();
    assert(color.red === 0);
    assert(color.green === 0);
    assert(color.blue === 0);

    color = new Color({ 0: 110, 1: 111, 2: 112 });
    color.red.should.equal(110);
    color.green.should.equal(111);
    color.blue.should.equal(112);
    color.intValue.should.equal(7237488);
    color.hexString.should.equal('#6e6f70');
    color.rgbString.should.equal('rgb(110, 111, 112)');

    color = new Color([110, 111, 112]);
    color.red.should.equal(110);
    color.green.should.equal(111);
    color.blue.should.equal(112);

    (() => {
      color.red = 100;
      color.green = 100;
      color.blue = 100;
      color.intValue = 100;
      color.hexString = 100;
      color.rgbString = 100;
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    const color = new Color({ 0: 110, 1: 111, 2: 112 });
    color.toRaw().should.deep.equal({ 0: 110, 1: 111, 2: 112 });
  });
});
