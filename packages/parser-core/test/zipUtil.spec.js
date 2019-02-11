import { should } from 'chai';
import fs from 'fs-extra';

import openZip from '../src/zipUtil';
import Paths from '../../../test/paths';

should(); // Initialize should

describe('Util - Zip', () => {
  after(() => {
    fs.removeSync('./temp');
  });

  it('openZip test', () => {
    return openZip(Paths.DEFAULT).then(async (zip) => {
      const entry = zip.find('mimetype')
      entry.should.not.null;
      const buffer = await zip.getFile(entry);
      Buffer.isBuffer(buffer).should.be.true;
      const string = await zip.getFile(entry, { encoding: 'utf8' });
      string.should.equal('application/epub+zip');
    });
  });

  it('extractAll test', (done) => {
    openZip(Paths.DEFAULT).then((zip) => {
      zip.extractAll('./temp').then(() => {
        done();
      });
    });
  });

  describe('Error Situation', () => {
    it('Invalid zip', () => {
      return openZip('?!').catch((err) => {
        err.code.should.equal('ENOENT');
      });
    });
  });
});
