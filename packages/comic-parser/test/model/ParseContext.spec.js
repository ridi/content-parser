import { should } from 'chai';

import ParseContext from '../../lib/model/ComicParseContext';

should(); // Initialize should

describe('Model - ParseContext', () => {
  it('Initialize test', () => {
    const item = new ParseContext();
    Object.keys(item).forEach((key) => {
      Object.getOwnPropertyDescriptor(item, key).writable.should.be.true;
    });
  });
});
