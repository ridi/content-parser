import { should } from 'chai';
import fs from 'fs';
import path from 'path';

import { readEntries, findEntry } from '../../src/util/readEntries';
import { stringContains } from '../../src/util';
import Files from '../files';

should(); // Initialize should

describe('Util - entry manager', () => {
  const file = path.join(Files.UNZIPPED_DEFAULT, 'mimetype');
  const expectedFile = {
    buffer: fs.readFileSync(file),
    string: fs.readFileSync(file, 'utf8'),
  };

  it('readEntries from zip', () => {
    return readEntries(Files.DEFAULT).then((result) => {
      const expectedList = [
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
      const { entries, zip } = result;
      zip.should.not.null;
      entries.map(entry => entry.entryName).should.deep.equal(expectedList);
      entries.forEach((entry) => {
        const keys = Object.keys(entry);
        stringContains(keys, 'method').should.be.true;
        stringContains(keys, 'extraLength').should.be.true;
      });

      const entry = findEntry(entries, 'mimetype');
      entry.getFile().should.deep.equal(expectedFile.buffer);
      entry.getFile('utf8').should.equal(expectedFile.string);
    });
  });

  it('readEntries from directory', () => {
    return readEntries(Files.UNZIPPED_DEFAULT).then((result) => {
      const expectedList = [
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
      const { entries } = result;
      entries.map(entry => entry.entryName).should.deep.equal(expectedList);

      const entry = findEntry(entries, 'mimetype');
      entry.getFile().should.deep.equal(expectedFile.buffer);
      entry.getFile('utf8').should.equal(expectedFile.string);
    });
  });
});
