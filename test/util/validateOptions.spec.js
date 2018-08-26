import { should } from 'chai';

import Errors from '../../src/errors';
import { isExists } from '../../src/util/typecheck';
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
    validateOptions({ f: 'f' }, DefaultOptions, OptionTypes).should.equal(Errors.INVALID_OPTIONS);
    validateOptions({ e: { g: 3 } }, DefaultOptions, OptionTypes).should.equal(Errors.INVALID_OPTIONS);
    validateOptions({ c: true }, DefaultOptions, OptionTypes).should.equal(Errors.INVALID_OPTION_VALUE);
    validateOptions({ e: { f: undefined } }, DefaultOptions, OptionTypes).should.equal(Errors.INVALID_OPTION_VALUE);
    isExists(validateOptions({ a: true, e: { f: 'f' } }, DefaultOptions, OptionTypes)).should.be.false;
  });
});
