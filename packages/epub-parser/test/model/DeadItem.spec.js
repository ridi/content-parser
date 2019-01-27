import { assert, should } from 'chai';

import DeadItem from '../../src/model/DeadItem';
import Item from '../../src/model/Item';

should(); // Initialize should

describe('Model - DeadItem', () => {
  it('constructor test', () => {
    let item = new DeadItem();
    assert(item.reason === DeadItem.Reason.UNDEFINED);
    assert(item instanceof Item);

    item = new DeadItem({
      id: 'toc.ncx', href: './toc.ncx', mediaType: 'application/x-dtbncx+xml', size: 151, reason: 'not_ncx'
    });
    item.reason.should.equal(DeadItem.Reason.NOT_NCX);

    item = new DeadItem({
      id: 'toc.ncx', href: './toc.ncx', mediaType: 'application/x-dtbncx+xml', size: 151, reason: 'invalid_reason'
    });
    item.reason.should.equal(DeadItem.Reason.UNKNOWN);

    (() => {
      item.reason = DeadItem.Reason.NOT_EXISTS;
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    let item = new DeadItem({
      id: 'toc.ncx', href: './toc.ncx', mediaType: 'application/x-dtbncx+xml', size: 151, reason: 'not_ncx'
    });
    item.toRaw().should.deep.equal({
      id: 'toc.ncx', href: './toc.ncx', mediaType: 'application/x-dtbncx+xml', size: 151, reason: DeadItem.Reason.NOT_NCX, itemType: DeadItem.name
    });

    item = new DeadItem({
      id: 'toc.ncx', href: './toc.ncx', mediaType: 'application/x-dtbncx+xml', size: 151, reason: 'invalid_reason'
    });
    item.toRaw().should.deep.equal({
      id: 'toc.ncx', href: './toc.ncx', mediaType: 'application/x-dtbncx+xml', size: 151, reason: DeadItem.Reason.UNKNOWN, itemType: DeadItem.name
    });
  });
});
