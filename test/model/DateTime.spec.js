import { assert, should } from 'chai';

import DateTime from '../../src/model/DateTime';

should(); // Initialize should

describe('Model - DateTime', () => {
  it('constructor test', () => {
    let date = new DateTime({});
    assert(date.value === undefined);
    assert(date.event === DateTime.Events.UNDEFINED);

    date = new DateTime('2018-09-01');
    date.value.should.equal('2018-09-01');
    date.event.should.equal(DateTime.Events.UNDEFINED);

    date = new DateTime({ value: '2018-09-01', event: 'creaTIon' });
    date.value.should.equal('2018-09-01');
    date.event.should.equal(DateTime.Events.CREATION);

    date = new DateTime({ value: '2018-09-01', event: 'Invalid event' });
    date.value.should.equal('2018-09-01');
    date.event.should.equal(DateTime.Events.UNKNOWN);

    (() => {
      date.value = '2017-09-01';
      date.event = DateTime.Events.MODIFICATION;
    }).should.throw(/read only property/gi);

    (() => {
      new DateTime();
    }).should.throw(/cannot read property/gi);
  });

  it('toRaw test', () => {
    let date = new DateTime({});
    date.toRaw().should.deep.equal({ value: undefined, event: DateTime.Events.UNDEFINED });

    date = new DateTime('2018-09-01');
    date.toRaw().should.deep.equal({ value: '2018-09-01', event: DateTime.Events.UNDEFINED });

    date = new DateTime({ value: '2018-09-01', event: 'creaTIon' });
    date.toRaw().should.deep.equal({ value: '2018-09-01', event: DateTime.Events.CREATION });

    date = new DateTime({ value: '2018-09-01', event: 'Invalid event' });
    date.toRaw().should.deep.equal({ value: '2018-09-01', event: DateTime.Events.UNKNOWN });
  });
});
