import { should } from 'chai';

import Errors from '../src/errors';
import validateOptions from '../src/validateOptions';

should(); // Initialize should

const OptionTypes = {
  a: 'Boolean',
  b: 'String',
  c: 'Number',
  d: 'String|Undefined',
  e: {
    f: 'String',
  },
};

describe('Util - Option util', () => {
  it('validateOptions test', () => {
    try {
      validateOptions({ f: 'f' }, OptionTypes);
    } catch (err) {
      err.code.should.equal(Errors.EINVAL.code);
    }
    try {
      validateOptions({ e: { g: 3 } }, OptionTypes);
    } catch (err) {
      err.code.should.equal(Errors.EINVAL.code);
    }
    try {
      validateOptions({ c: true }, OptionTypes);
    } catch (err) {
      err.code.should.equal(Errors.EINVAL.code);
    }
    try {
      validateOptions({ e: { f: undefined } }, OptionTypes);
    } catch (err) {
      err.code.should.equal(Errors.EINVAL.code);
    }
    try {
      validateOptions({ a: true, e: { f: 'f' } }, OptionTypes);
    } catch (err) {
      err.code.should.equal(Errors.EINVAL.code);
    }
  });
});
