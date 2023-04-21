import { assert, should } from 'chai';

import Version from '../lib/Version';

should(); // Initialize should

describe('Version', () => {
  it('Initialize test', () => {
    let version = new Version('2');
    version.toString().should.equal('2.0.0');

    version = new Version('2.1');
    version.toString().should.equal('2.1.0');

    version = new Version('2.1.3');
    version.toString().should.equal('2.1.3');

    version = new Version();
    version.toString().should.equal('1.0.0');

    version = new Version('x');
    version.toString().should.equal('1.0.0');

    version = new Version('2.x');
    version.toString().should.equal('2.0.0');

    version = new Version('x.x');
    version.toString().should.equal('1.0.0');
  });
});
