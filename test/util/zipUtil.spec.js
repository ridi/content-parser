import { should } from 'chai';

import { extractAll, openZip } from '../../src/util/zipUtil';
import Files from '../files';

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
        done();
      });
    });
  });

  it('extractAll test (use options)', (done) => {
    const options = {
      createIntermediateDirectories: false,
      removePreviousFile: false,
      close: false,
    };
    openZip(Files.DEFAULT).then((zip) => {
      extractAll(zip, './tmp', options).catch((err) => {
        err.code.should.equal('ENOENT');
        zip.close();
        done();
      });
    });
  });
});
