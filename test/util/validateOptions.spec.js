import { should } from 'chai';

import Errors from '../../src/constant/errors';
import validateOptions from '../../src/util/validateOptions';

should(); // Initialize should

const DefaultOptions = {
  a: true,
  b: 'b',
  c: 5,
  d: undefined,
  e: {
    f: 'f',
  },
};

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
      validateOptions({ f: 'f' }, DefaultOptions, OptionTypes);
    } catch (err) {
      err.code.should.equal(Errors.EINVAL.code);
    }
    try {
      validateOptions({ e: { g: 3 } }, DefaultOptions, OptionTypes);
    } catch (err) {
      err.code.should.equal(Errors.EINVAL.code);
    }
    try {
      validateOptions({ c: true }, DefaultOptions, OptionTypes);
    } catch (err) {
      err.code.should.equal(Errors.EINVAL.code);
    }
    try {
      validateOptions({ e: { f: undefined } }, DefaultOptions, OptionTypes);
    } catch (err) {
      err.code.should.equal(Errors.EINVAL.code);
    }
    try {
      validateOptions({ a: true, e: { f: 'f' } }, DefaultOptions, OptionTypes);
    } catch (err) {
      err.code.should.equal(Errors.EINVAL.code);
    }
  });
});
