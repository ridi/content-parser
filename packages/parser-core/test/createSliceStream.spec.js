import { assert } from 'chai';
import fs from 'fs';

import createSliceStream from '../src/createSliceStream';
import Paths from '../../../test/paths';

describe('Util - createSliceStream', () => {
  const filePath = Paths.DEFAULT;
  const test = (start, end) => {
    const readStream = fs.createReadStream(filePath, { highWaterMark: 1024 });
    return new Promise((resolve, reject) => {
      let data = Buffer.from([]);
      readStream
        .pipe(createSliceStream(start, end))
        .on('error', error => reject(error))
        .on('data', chunk => {
          data = Buffer.concat([data, chunk]);
        })
        .on('end', () => resolve(data));
    });
  };

  describe('Only certain range of data is taken from stream', () => {
    const file = fs.readFileSync(filePath);

    it('0~100', () => {
      return test(0, 100).then(data => {
        const expected = file.slice(0, 100);
        assert(data.length === 100);
        assert(expected.equals(data));
      });
    });

    it('100~300', () => {
      return test(100, 300).then(data => {
        const expected = file.slice(100, 300);
        assert(data.length === 200);
        assert(expected.equals(data));
      });
    });

    it('500~2000', () => {
      return test(500, 2000).then(data => {
        const expected = file.slice(500, 2000);
        assert(data.length === 1500);
        assert(expected.equals(data));
      });
    });

    it('500~Infinity', () => {
      return test(500, Infinity).then(data => {
        const expected = file.slice(500, file.length);
        assert(data.length === file.length - 500);
        assert(expected.equals(data));
      });
    });

    it('undefined~undefined', () => {
      return test().then(data => {
        const expected = file;
        assert(expected.length === data.length);
        assert(expected.equals(data));
      });
    });

    it('500~3000000', () => {
      return test(500, 3000000).then(data => {
        const expected = file.slice(500, file.length);
        assert(data.length === file.length - 500);
        assert(expected.equals(data));
      });
    });
  });
});
