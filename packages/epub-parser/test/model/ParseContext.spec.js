import { should } from 'chai';

import ParseContext from '../../src/model/ParseContext';

should(); // Initialize should

describe('Model - ParseContext', () => {
  it('constructor test', () => {
    const item = new ParseContext();
    Object.keys(item).forEach((key) => {
      Object.getOwnPropertyDescriptor(item, key).writable.should.be.true;
    });
  });
});
