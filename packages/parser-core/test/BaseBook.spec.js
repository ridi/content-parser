import { expect, should } from 'chai';
import BaseBook from '../lib/BaseBook';


should(); // Initialize should
describe('BaseBook', () => {
  const baseBook = new BaseBook();
  it('toRaw() should throw an error', () => {
    expect(baseBook.toRaw).to.throw(Error, 'You must override in a subclass.');
  })
});
