import { should } from 'chai';
import fs from 'fs';
import path from 'path';

import { stringContains, isString } from '../../src/util';
import readEntries from '../../src/util/readEntries';
import Paths from '../paths';

should(); // Initialize should

describe('Util - entry manager', () => {
  const filePath = path.join(Paths.UNZIPPED_DEFAULT, 'mimetype');
  const expectedFile = {
    buffer: fs.readFileSync(filePath),
    string: fs.readFileSync(filePath, 'utf8'),
  };

  it('readEntries from zip', () => {
    return readEntries(Paths.DEFAULT).then((entries) => {
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
      isString(entries.source).should.be.false;
      entries.map(entry => entry.entryPath).should.deep.equal(expectedList);
      entries.forEach((entry) => {
        const keys = Object.keys(entry);
        stringContains(keys, 'method').should.be.true;
        stringContains(keys, 'extraFieldLength').should.be.true;
      });

      const entry = entries.find('mimetype');
      entry.getFile().then(file => file.should.deep.equal(expectedFile.buffer));
      entry.getFile('utf8').then(file => file.should.equal(expectedFile.string));
    });
  });

  it('readEntries from directory', () => {
    return readEntries(Paths.UNZIPPED_DEFAULT).then((entries) => {
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
      isString(entries.source).should.be.true;
      entries.map(entry => entry.entryPath).should.deep.equal(expectedList);

      const entry = entries.find('mimetype');
      entry.getFile().then(file => file.should.deep.equal(expectedFile.buffer));
      entry.getFile('utf8').then(file => file.should.equal(expectedFile.string));
    });
  });

  describe('Error Situation', () => {
    it('Invalid file path', () => {
      return readEntries('?!').catch((err) => {
        err.code.should.equal('ENOENT');
      });
    });
  });
});
