import { should } from 'chai';

import { extractAll, openZip } from '../../src/util/zipUtil';
import Files from '../files';
import { removeDirectory } from '../../src/util/directory';

should(); // Initialize should

describe('Util - Zip', () => {
  it('Valid zip', () => {
    return openZip(Files.DEFAULT).then((zip) => {
      zip.should.not.null;
      zip.close();
    });
  });

  it('Invalid zip', () => {
    return openZip('?!').catch((err) => {
      err.code.should.equal('ENOENT');
    });
  });

  it('extractAll test (default)', (done) => {
    openZip(Files.DEFAULT).then((zip) => {
      extractAll(zip, './temp').then(() =>  {
        zip.close();
        removeDirectory('./temp');
        done();
      });
    });
  });
});
