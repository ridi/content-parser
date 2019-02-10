import { assert, should } from 'chai';

import Identifier from '../../src/model/Identifier';

should(); // Initialize should

describe('Model - Identifier', () => {
  it('Initialize test', () => {
    let identifier = new Identifier();
    assert(identifier.value === undefined);
    assert(identifier.scheme === Identifier.Schemes.UNDEFINED);

    identifier = new Identifier('0000000000000');
    identifier.value.should.equal('0000000000000');
    identifier.scheme.should.equal(Identifier.Schemes.UNDEFINED);

    identifier = new Identifier({ value: '0000000000000', scheme: 'isbN' });
    identifier.value.should.equal('0000000000000');
    identifier.scheme.should.equal(Identifier.Schemes.ISBN);

    identifier = new Identifier({ value: '0000000000000', scheme: 'Invalid scheme' });
    identifier.value.should.equal('0000000000000');
    identifier.scheme.should.equal(Identifier.Schemes.UNKNOWN);

    (() => {
      identifier.value = '0000000000000';
      identifier.scheme = Identifier.Schemes.ISBN13;
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    let identifier = new Identifier({});
    identifier.toRaw().should.deep.equal({ value: undefined, scheme: Identifier.Schemes.UNDEFINED });

    identifier = new Identifier('0000000000000');
    identifier.toRaw().should.deep.equal({ value: '0000000000000', scheme: Identifier.Schemes.UNDEFINED });

    identifier = new Identifier({ value: '0000000000000', scheme: 'isbN' });
    identifier.toRaw().should.deep.equal({ value: '0000000000000', scheme: Identifier.Schemes.ISBN });

    identifier = new Identifier({ value: '0000000000000', scheme: 'Invalid scheme' });
    identifier.toRaw().should.deep.equal({ value: '0000000000000', scheme: Identifier.Schemes.UNKNOWN });
  });
});
