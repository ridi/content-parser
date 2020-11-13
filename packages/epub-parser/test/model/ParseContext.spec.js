import { should } from 'chai';

import EpubParseContext from '../../src/model/EpubParseContext';

should(); // Initialize should

describe('Model - ParseContext', () => {
  it('Initialize test', () => {
    const item = new EpubParseContext();
    Object.keys(item).forEach((key) => {
      Object.getOwnPropertyDescriptor(item, key).writable.should.be.true;
    });
  });
});
