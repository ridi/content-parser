import { should, expect } from 'chai';
import fs from 'fs';
import path from 'path';

import { readCacheFile, writeCacheFile } from '../src/cacheFile';
import Errors from '../src/errors';
import { isExists, isString } from '../src/typecheck';
import readEntries from '../src/readEntries';
import { stringContains } from '../src/stringUtil';
import Paths from '../../../test/paths';
import TestSyncStreamCryptoProvider from './testSyncStreamCryptoProvider';
import TestSyncCryptoProvider from './testSyncCryptoProvider';
import TestAsyncCryptoProvider from './testAsyncCryptoProvider';



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
    'OEBPS/Video/empty.mp4',
    'OEBPS/Images/ridibooks_logo.png',
    'OEBPS/Images/ridibooks.png',
    'OEBPS/Styles/Style0001.css',
    'OEBPS/content.opf',
    'OEBPS/Text/Section0001.xhtml',
    "OEBPS/Text/Section 0007.xhtml",
    'OEBPS/Text/Section0005.xhtml',
    'OEBPS/Text/Section0002.xhtml',
    'OEBPS/Text/Section0004.xhtml',
    'OEBPS/Text/Section0006.xhtml',
    'OEBPS/Text/Cover.xhtml',
    "OEBPS/Text/Section%200008.xhtml",
    'OEBPS/Fonts/NotoSans-Regular.ttf',
    'OEBPS/toc.ncx'
  ];

  const expectedListForDir = [
    'META-INF/container.xml',
    'OEBPS/Fonts/NotoSans-Regular.ttf',
    'OEBPS/Images/ridibooks.png',
    'OEBPS/Images/ridibooks_logo.png',
    'OEBPS/Styles/Style0001.css',
    'OEBPS/Text/Cover.xhtml',
    "OEBPS/Text/Section 0007.xhtml",
    "OEBPS/Text/Section%200008.xhtml",
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

  describe('without CryptoProvider', () => {
    it('Read entries from zip', async () => {
      const entries = await readEntries(Paths.DEFAULT);
      entries.source.should.not.null;
      entries.length.should.equal(expectedListForZip.length);
      entries.get(0).should.equal(entries.first);
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

      isExists(entries.find('OEBPS/Text/Section 0008.xhtml', false)).should.be.true;
      isExists(entries.find('OEBPS/Text/Section 0008.xhtml', true)).should.be.false;
    });


    it('Read entries from directory', async () => {
      const entries = await readEntries(Paths.UNZIPPED_DEFAULT);
      entries.source.should.equal(Paths.UNZIPPED_DEFAULT);
      entries.length.should.equal(expectedListForDir.length);
      entries.get(0).should.equal(entries.first);
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

      isExists(entries.find('OEBPS/Text/Section 0008.xhtml', false)).should.be.true;
      isExists(entries.find('OEBPS/Text/Section 0008.xhtml', true)).should.be.false;
    });

    it('Read entries from directory (cached)', () => {
      return readEntries(Paths.UNZIPPED_DEFAULT).then(entries => {
        entries.source.should.equal(Paths.UNZIPPED_DEFAULT);
        entries.map(entry => entry.entryPath).should.deep.equal(expectedListForDir);
      });
    });

    it('Read entries from file', async () => {
      const entries = await readEntries(Paths.PDF);
      entries.source.should.equal(Paths.PDF);
      entries.length.should.equal(1);

      const entry = entries.first;
      entry.entryPath.should.equal(Paths.PDF);
      const file = await entry.getFile();
      file.should.not.null;
    });

    it('Read entries from file', async () => {
      const entries = await readEntries(Paths.PDF, new TestAsyncCryptoProvider);
      entries.source.should.equal(Paths.PDF);
      entries.length.should.equal(1);

      const entry = entries.first;
      entry.entryPath.should.equal(Paths.PDF);
      const file = await entry.getFile();
      file.should.not.null;
    });

    describe('Error Situation', () => {
      it('Invalid file path', () => {
        return readEntries('?!').catch((err) => {
          err.code.should.equal(Errors.ENOENT.code);
        });
      });

      it('No such file from directory', async () => {
        const dir = Paths.UNZIPPED_DEFAULT;
        const paths = JSON.parse(readCacheFile(dir));
        paths[paths.length - 1] = `${paths[paths.length - 1]}.bak`;
        writeCacheFile(dir, JSON.stringify(paths), true);

        const entries = await readEntries(dir);
        const entry = entries.find('mimetype.bak');
        try { await entry.getFile() } catch (err) { err.code.should.equal(Errors.ENOFILE.code); }
      });
    });
  });
  describe('with CryptoProvider', () => {
    describe('getFile', () => {
      it(': TestSyncStreamCryptoProvider', async () => {
        const entries = await readEntries(Paths.UNZIPPED_DEFAULT, new TestSyncStreamCryptoProvider());
        entries.sort((a, b) => a.entryPath.localeCompare(b.entryPath));
        entries.source.should.equal(Paths.UNZIPPED_DEFAULT);
        entries.length.should.equal(expectedListForDir.length);
        entries.get(0).should.equal(entries.first);
        entries.map(entry => entry.entryPath).should.deep.equal([...expectedListForDir].sort((a, b) => a.localeCompare(b)));

        const entry = entries.find('mimetype');
        let file = await entry.getFile();
        file.should.deep.equal(expectedFile.buffer);
        file = await entry.getFile({ encoding: 'utf8' });
        file.should.equal(expectedFile.string);
        file = await entry.getFile({ end: 100000 });
        file.should.deep.equal(expectedFile.buffer);
        file = await entry.getFile({ encoding: 'utf8', end: 11 });
        file.should.deep.equal(expectedFile.string.substr(0, 11));

        isExists(entries.find('OEBPS/Text/Section 0008.xhtml', false)).should.be.true;
        isExists(entries.find('OEBPS/Text/Section 0008.xhtml', true)).should.be.false;
      });
      it(': TestSyncCryptoProvider', async () => {
        const entries = await readEntries(Paths.UNZIPPED_DEFAULT, new TestSyncCryptoProvider());
        entries.source.should.equal(Paths.UNZIPPED_DEFAULT);
        entries.length.should.equal(expectedListForDir.length);
        entries.get(0).should.equal(entries.first);
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

        isExists(entries.find('OEBPS/Text/Section 0008.xhtml', false)).should.be.true;
        isExists(entries.find('OEBPS/Text/Section 0008.xhtml', true)).should.be.false;
      });
      it(': TestAsyncCryptoProvider', async () => {
        const entries = await readEntries(Paths.UNZIPPED_DEFAULT, new TestAsyncCryptoProvider());
        entries.source.should.equal(Paths.UNZIPPED_DEFAULT);
        entries.length.should.equal(expectedListForDir.length);
        entries.get(0).should.equal(entries.first);
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

        isExists(entries.find('OEBPS/Text/Section 0008.xhtml', false)).should.be.true;
        isExists(entries.find('OEBPS/Text/Section 0008.xhtml', true)).should.be.false;
      });
    })
    describe('fromFile', async () => {
      it(': TestSyncStreamCryptoProvider', async () => {
        const entries = await readEntries(Paths.PDF, new TestSyncStreamCryptoProvider());
        entries.source.should.equal(Paths.PDF);
        entries.length.should.equal(1);

        const entry = entries.first;
        entry.entryPath.should.equal(Paths.PDF);
        const file = await entry.getFile();
        file.should.not.null;
      })
      it(': TestSyncCryptoProvider', async () => {
        const entries = await readEntries(Paths.PDF, new TestSyncCryptoProvider());
        entries.source.should.equal(Paths.PDF);
        entries.length.should.equal(1);

        const entry = entries.first;
        entry.entryPath.should.equal(Paths.PDF);
        const file = await entry.getFile();
        file.should.not.null;
      });
      it(': TestAsyncCryptoProvider - with encoding', async () => {
        const entries = await readEntries(Paths.PDF, new TestAsyncCryptoProvider());
        entries.source.should.equal(Paths.PDF);
        entries.length.should.equal(1);

        const entry = entries.first;
        entry.entryPath.should.equal(Paths.PDF);
        const file = await entry.getFile({encoding: 'utf-8'});
        file.should.not.null;
      });
    });
  });
});
