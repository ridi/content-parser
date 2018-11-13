import { should } from 'chai';

import Errors from '../../src/constant/errors';
import CryptoProvider from '../../src/cryptor/CryptoProvider';

should(); // Initialize should

class TestCryptoProvider extends CryptoProvider { }

describe('CryptoProvider', () => {
  it('Subclass required', () => {
    try { new CryptoProvider(); } catch (e) { e.code.should.equal(Errors.EINTR.code); }
    const provider = new TestCryptoProvider();
    try { provider.run(); } catch (e) { e.code.should.equal(Errors.EINTR.code); }
    try { provider.encrypt(); } catch (e) { e.code.should.equal(Errors.EINTR.code); }
    try { provider.decrypt(); } catch (e) { e.code.should.equal(Errors.EINTR.code); }
    try { provider.onStatusChanged(); } catch (e) { e.code.should.equal(Errors.EINTR.code); }
  });
});
