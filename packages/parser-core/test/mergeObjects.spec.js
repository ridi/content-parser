import { should } from 'chai';

import mergeObjects from '../src/mergeObjects';

should(); // Initialize should

describe('Util - Merge objects', () => {
  it('mergeObjects test', () => {
    const expect = {
      a: true,
      b: true,
      c: {
        d: 'd',
        e: undefined,
        f: {
          g: 8,
        },
        h: '',
      },
    };
    mergeObjects(
      { // obj1
        a: 'a',
        b: true,
        c: {
          d: 5,
          e: undefined,
          f: {},
        },
      },
      { // obj2
        a: true,
        c: {
          d: 'd',
          f: {
            g: 8,
          },
          h: '',
        },
      },
    ).should.deep.equal(expect);
  });
});
