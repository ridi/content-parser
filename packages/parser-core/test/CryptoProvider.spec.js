import { should } from 'chai';

import Errors from '../src/errors';
import CryptoProvider from '../src/CryptoProvider';

should(); // Initialize should

class TestCryptoProvider extends CryptoProvider { }

describe('CryptoProvider', () => {
  it('Subclass required', () => {
    try { new CryptoProvider(); } catch (e) { e.code.should.equal(Errors.EINTR.code); }
    const provider = new TestCryptoProvider();
    try { provider.getCryptor(); } catch (e) { e.code.should.equal(Errors.EINTR.code); }
    try { provider.run(); } catch (e) { e.code.should.equal(Errors.EINTR.code); }
  });
});
