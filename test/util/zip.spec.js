import { should } from 'chai';

import Files from '../files';
import openZip from '../../src/util/zip';

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
});
