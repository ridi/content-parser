import { should } from 'chai';

import CssItem from '../../src/model/CssItem';
import DeadItem from '../../src/model/DeadItem';
import FontItem from '../../src/model/FontItem';
import InlineCssItem from '../../src/model/InlineCssItem';
import Item from '../../src/model/Item';
import NcxItem from '../../src/model/NcxItem';
import SpineItem from '../../src/model/SpineItem';
import SvgItem from '../../src/model/SvgItem';
import { isExists } from '../../src/util';
import { getItemEncoding, getItemTypeFromMediaType } from '../../src/util/itemUtil';

should(); // Initialize should

describe('Util - Item utils', () => {
  it('getItemEncoding test', () => {
    isExists(getItemEncoding(Item)).should.be.false;
    getItemEncoding(SpineItem).should.equal('utf8');
    getItemEncoding(CssItem).should.equal('utf8');
    getItemEncoding(SvgItem).should.equal('utf8');
    getItemEncoding(new InlineCssItem({})).should.equal('utf8');
    getItemEncoding(new NcxItem({})).should.equal('utf8');
  });

  it('getItemTypeFromMediaType test', () => {
    getItemTypeFromMediaType('application/vnd.ms-opentype').should.equal(FontItem);
    getItemTypeFromMediaType('APPLICATION/XHTML+XML').should.equal(SpineItem);
    getItemTypeFromMediaType('text/plain').should.equal(DeadItem);
  });
});
