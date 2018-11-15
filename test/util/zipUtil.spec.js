import { should } from 'chai';
import fs from 'fs-extra';

import openZip from '../../src/util/zipUtil';
import Paths from '../paths';

should(); // Initialize should

describe('Util - Zip', () => {
  after(() => {
    fs.removeSync('./temp');
  });

  it('Valid zip', () => {
    return openZip(Paths.DEFAULT).then((zip) => {
      zip.should.not.null;
    });
  });

  it('Invalid zip', () => {
    return openZip('?!').catch((err) => {
      err.code.should.equal('ENOENT');
    });
  });

  it('extractAll test', (done) => {
    openZip(Paths.DEFAULT).then((zip) => {
      zip.extractAll('./temp').then(() => {
        done();
      });
    });
  });
});
