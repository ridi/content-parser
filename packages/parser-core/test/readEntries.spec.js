import { should } from 'chai';
import fs from 'fs';
import path from 'path';

import { readCacheFile, writeCacheFile } from '../src/cacheFile';
import Errors from '../src/errors';
import { isString } from '../src/typecheck';
import readEntries from '../src/readEntries';
import { stringContains } from '../src/stringContains';
import Paths from '../../../test/paths';

should(); // Initialize should

describe('Util - entry manager', () => {
  const filePath = path.join(Paths.UNZIPPED_DEFAULT, 'mimetype');
  const expectedFile = {
    buffer: fs.readFileSync(filePath),
    string: fs.readFileSync(filePath, 'utf8'),
  };

  const expectedListForZip = [
    'mimetype',
    'META-INF/container.xml',
    'OEBPS/content.opf',
    'OEBPS/Fonts/NotoSans-Regular.ttf',
    'OEBPS/Images/ridibooks.png',
    'OEBPS/Images/ridibooks_logo.png',
    'OEBPS/Styles/Style0001.css',
    'OEBPS/Text/Cover.xhtml',
    'OEBPS/Text/Section0001.xhtml',
    'OEBPS/Text/Section0002.xhtml',
    'OEBPS/Text/Section0004.xhtml',
    'OEBPS/Text/Section0005.xhtml',
    'OEBPS/Text/Section0006.xhtml',
    'OEBPS/toc.ncx',
    'OEBPS/Video/empty.mp4',
  ];

  it('Read entries from zip', done => {
    (async () => {
      const entries = await readEntries(Paths.DEFAULT);
      isString(entries.source).should.be.false;
      entries.map(entry => entry.entryPath).should.deep.equal(expectedListForZip);
      entries.forEach(entry => {
        const keys = Object.keys(entry);
        stringContains(keys, 'method').should.be.true;
        stringContains(keys, 'extraFieldLength').should.be.true;
      });
  
      const entry = entries.find('mimetype');
      let file = await entry.getFile();
      file.should.deep.equal(expectedFile.buffer);
      file = await entry.getFile({ encoding: 'utf8' });
      file.should.equal(expectedFile.string);
      file = await entry.getFile({ end: 100000 });
      file.should.deep.equal(expectedFile.buffer);
      file = await entry.getFile({ encoding: 'utf8', end: 11 });
      file.should.deep.equal(expectedFile.string.substr(0, 11));

      done();
    })();
  });
  
  const expectedListForDir = [
    'META-INF/container.xml',
    'OEBPS/Fonts/NotoSans-Regular.ttf',
    'OEBPS/Images/ridibooks.png',
    'OEBPS/Images/ridibooks_logo.png',
    'OEBPS/Styles/Style0001.css',
    'OEBPS/Text/Cover.xhtml',
    'OEBPS/Text/Section0001.xhtml',
    'OEBPS/Text/Section0002.xhtml',
    'OEBPS/Text/Section0004.xhtml',
    'OEBPS/Text/Section0005.xhtml',
    'OEBPS/Text/Section0006.xhtml',
    'OEBPS/Video/empty.mp4',
    'OEBPS/content.opf',
    'OEBPS/toc.ncx',
    'mimetype',
  ];

  it('Read entries from directory', done => {
    (async () => {
      const entries = await readEntries(Paths.UNZIPPED_DEFAULT);
      isString(entries.source).should.be.true;
      entries.map(entry => entry.entryPath).should.deep.equal(expectedListForDir);
  
      const entry = entries.find('mimetype');
      let file = await entry.getFile();
      file.should.deep.equal(expectedFile.buffer);
      file = await entry.getFile({ encoding: 'utf8' });
      file.should.equal(expectedFile.string);
      file = await entry.getFile({ end: 100000 });
      file.should.deep.equal(expectedFile.buffer);
      file = await entry.getFile({ encoding: 'utf8', end: 11 });
      file.should.deep.equal(expectedFile.string.substr(0, 11));

      done();
    })();
  });

  it('Read entries from directory (cached)', () => {
    return readEntries(Paths.UNZIPPED_DEFAULT).then(entries => {
      isString(entries.source).should.be.true;
      entries.map(entry => entry.entryPath).should.deep.equal(expectedListForDir);
    });
  });

  describe('Error Situation', () => {
    it('Invalid file path', () => {
      return readEntries('?!').catch((err) => {
        err.code.should.equal(Errors.ENOENT.code); 
      });
    });

    it('No such file from directory', done => {
      (async () => {
        const dir = Paths.UNZIPPED_DEFAULT;
        const paths = JSON.parse(readCacheFile(dir));
        paths[paths.length - 1] = `${paths[paths.length - 1]}.bak`;
        writeCacheFile(dir, JSON.stringify(paths), true);
        const entries = await readEntries(dir);
        const entry = entries.find('mimetype.bak');
        try { await entry.getFile() } catch (err) { err.code.should.equal(Errors.ENOFILE.code); }
        done();
      })();
    });
  });
});
