import { should } from 'chai';
import fs from 'fs';

import createSliceStream from '../lib/createSliceStream';
import { conditionally } from '../lib/streamUtil';
import Paths from '../../../test/paths';

should(); // Initialize should

describe('Util - stream', () => {
  const filePath = Paths.SPINE_LOADER_ORIGIN;
  const test = (value) => {
    const readStream = fs.createReadStream(filePath);
    return new Promise((resolve, reject) => {
      let data = Buffer.from([]);
      readStream
        .pipe(conditionally(value, createSliceStream(0, 150)))
        .on('error', error => reject(error))
        .on('data', chunk => {
          data = Buffer.concat([data, chunk]);
        })
        .on('end', () => resolve(data));
    });
  };

  it('conditionally test (true)', () => {
    return test(true).then((data) => {
      data.length.should.equal(150);
    });
  });

  it('conditionally test (true)', () => {
    return test(() => true).then((data) => {
      data.length.should.equal(150);
    });
  });

  it('conditionally test (false)', () => {
    return test(false).then((data) => {
      data.length.should.equal(1222);
    });
  });

  it('conditionally test (false)', () => {
    return test(() => false).then((data) => {
      data.length.should.equal(1222);
    });
  });
});
