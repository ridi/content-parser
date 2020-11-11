import { expect, should } from 'chai';
import fs from 'fs-extra';

import Errors from '../src/errors';
import openZip from '../src/zipUtil';
import Paths from '../../../test/paths';
import TestSyncCryptoProvider from './testSyncCryptoProvider';
import TestSyncStreamCryptoProvider from './testSyncStreamCryptoProvider';
import TestAsyncCryptoProvider from './testAsyncCryptoProvider';


should(); // Initialize should

describe('Util - Zip', () => {
  after(() => {
    fs.removeSync('./temp');
  });

  it('openZip test', async () => {
    const zip = await openZip(Paths.DEFAULT);
    const entry = zip.find('mimetype');
    entry.should.not.null;
    const buffer = await zip.getFile(entry);
    Buffer.isBuffer(buffer).should.be.true;
    const string = await zip.getFile(entry, { encoding: 'utf8' });
    string.should.equal('application/epub+zip');
  });

  it('extractAll test', async () => {
    const zip = await openZip(Paths.DEFAULT);
    await zip.extractAll('./temp');
  });
  it('extractAll test with cryptoprovider', async () => {
    const zip = await openZip(Paths.DEFAULT, new TestSyncCryptoProvider);
    await zip.extractAll('./temp');
  });

  it('extractAll with not overwite', async () => {
    const zip = await openZip(Paths.DEFAULT);
    await zip.extractAll('./temp');
    await zip.extractAll('./temp', false).catch((error) => {
      error.code.should.equal(Errors.EEXIST.code);
    });
  });

  describe('Error Situation', () => {
    it('Invalid zip', () => {
      return openZip('?!').catch((err) => {
        err.code.should.equal('ENOENT');
      });
    });
  });
  describe('works with CryptoProvider', () => {
    it(': AsyncCryptoProvider', async () => {
      const testCryptoProvider = new TestAsyncCryptoProvider();
      const zip = await openZip(Paths.DEFAULT, testCryptoProvider);
      const entry = zip.find('mimetype');
      entry.should.be.not.undefined.and.not.null;
      const buffer = await zip.getFile(entry);
      Buffer.isBuffer(buffer).should.be.true;
      expect(buffer).to.deep.equal(entry.getData());
    })
    it(': SyncCryptoProvider', async () => {
      const testCryptoProvider = new TestSyncCryptoProvider();
      const zip = await openZip(Paths.DEFAULT, testCryptoProvider);
      const entry = zip.find('mimetype');
      entry.should.be.not.undefined.and.not.null;
      const buffer = await zip.getFile(entry);
      Buffer.isBuffer(buffer).should.be.true;
      expect(buffer).to.deep.equal(entry.getData());
    })
  })
});
