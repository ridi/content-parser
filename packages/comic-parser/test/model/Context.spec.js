import { should } from 'chai';

import Context from '../../src/model/Context';

should(); // Initialize should

describe('Model - Context', () => {
  it('constructor test', () => {
    const item = new Context();
    Object.keys(item).forEach((key) => {
      Object.getOwnPropertyDescriptor(item, key).writable.should.be.true;
    });
  });
});
