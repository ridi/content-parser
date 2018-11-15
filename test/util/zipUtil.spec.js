import { should } from 'chai';
import fs from 'fs-extra';

import openZip from '../../src/util/zipUtil';
import Files from '../files';

should(); // Initialize should

describe('Util - Zip', () => {
  after(() => {
    fs.removeSync('./temp');
  });

  it('Valid zip', () => {
    return openZip(Files.DEFAULT).then((zip) => {
      zip.should.not.null;
    });
  });

  it('Invalid zip', () => {
    return openZip('?!').catch((err) => {
      err.code.should.equal('ENOENT');
    });
  });

  it('extractAll test', (done) => {
    openZip(Files.DEFAULT).then((zip) => {
      zip.extractAll('./temp').then(() => {
        done();
      });
    });
  });
});
