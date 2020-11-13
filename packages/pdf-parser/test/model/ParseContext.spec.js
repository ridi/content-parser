import { should } from 'chai';

import PdfParseContext from '../../src/model/PdfParseContext';

should(); // Initialize should

describe('Model - ParseContext', () => {
  it('Initialize test', () => {
    const item = new PdfParseContext();
    Object.keys(item).forEach((key) => {
      Object.getOwnPropertyDescriptor(item, key).writable.should.be.true;
    });
  });
});
