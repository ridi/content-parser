import { should } from 'chai';

import { getItemEncoding, getItemType } from '../../src/util/itemUtil';
import { isExists } from '../../src/util';
import CssItem from '../../src/model/CssItem';
import DeadItem from '../../src/model/DeadItem';
import FontItem from '../../src/model/FontItem';
import InlineCssItem from '../../src/model/InlineCssItem';
import Item from '../../src/model/Item';
import NcxItem from '../../src/model/NcxItem';
import SpineItem from '../../src/model/SpineItem';
import SvgItem from '../../src/model/SvgItem';

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

  it('getItemType test', () => {
    getItemType('application/vnd.ms-opentype').should.equal(FontItem);
    getItemType('APPLICATION/XHTML+XML').should.equal(SpineItem);
    getItemType('text/plain').should.equal(DeadItem);
  });
});
