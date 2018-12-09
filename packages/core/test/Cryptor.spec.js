import { should } from 'chai';

import Cryptor, {
  hex,
  utf8,
  Modes,
  Counter,
  Padding,
} from '../src/Cryptor';
import Errors from '../src/errors';

should(); // Initialize should

describe('Cryptor', () => {
  describe('Parameters validation', () => {
    it('Required parameter missing', () => {
      // mode missing
      try { new Cryptor(); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }

      // config missing
      try { new Cryptor(Modes.ECB); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }

      // key missing
      try { new Cryptor(Modes.ECB, {}); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }

      // iv missing
      const key = 'i_am_key';
      try { new Cryptor(Modes.CBC, { key }); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }
      try { new Cryptor(Modes.CFB, { key }); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }
      try { new Cryptor(Modes.OFB, { key }); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }

      // segmentSize missing
      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      try { new Cryptor(Modes.CFB, { key, iv }); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }

      // counter missing
      try { new Cryptor(Modes.CTR, { key }); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }
    });

    it('Invalid parameter', () => {
      // Invalid mode
      try { new Cryptor('ECB'); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }
      try { new Cryptor({}); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Invalid key type
      try { new Cryptor(Modes.ECB, { key: 36474145 }); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Invalid iv type
      let key = 'i_am_key';
      try { new Cryptor(Modes.CBC, { key, iv: true }); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Invalid segmentSize type
      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      try { new Cryptor(Modes.CFB, { key, iv, segmentSize: '128' }); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Invalid counter type
      try { new Cryptor(Modes.CTR, { key, counter: '5' }); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Invalid padding type
      try { new Cryptor(Modes.ECB, { key, padding: 32 }); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Inavlid bytes type
      key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      try { new Cryptor(Modes.ECB, { key }).encrypt(); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }
      try { new Cryptor(Modes.ECB, { key }).decrypt(); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }
    });
  });

  describe('cryption by mode', () => {
    it('ECB test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // Convert text to bytes
      const text = 'TextMustBe16Byte';
      const textBytes = utf8.toBytes(text);

      // Create cryptor
      const cryptor = new Cryptor(Modes.ECB, { key });

      // Encryption
      const encryptedBytes = cryptor.encrypt(textBytes);
      const encryptedHex = hex.fromBytes(encryptedBytes);
      encryptedHex.should.equal('a7d93b35368519fac347498dec18b458');

      // Decryption
      const decryptBytes = cryptor.decrypt(encryptedBytes);
      const decryptedText = utf8.fromBytes(decryptBytes);
      decryptedText.should.equal(text);
    });

    it('CBC test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // The initialization vector (must be 16 bytes)
      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // Convert text to bytes (text must be a multiple of 16 bytes)
      const text = 'TextMustBe16Byte';
      const textBytes = utf8.toBytes(text);

      // Create cryptor instance
      let cryptor = new Cryptor(Modes.CBC, { key, iv });

      // Encryption
      const encryptedBytes = cryptor.encrypt(textBytes);
      const encryptedHex = hex.fromBytes(encryptedBytes);
      encryptedHex.should.equal('e5237e9a8938d805038ae117b4f8f53a');

      // The CBC mode maintains internal state, so to decrypt a new instance must be instantiated.
      cryptor = new Cryptor(Modes.CBC, { key, iv });

      // Decryption
      const decryptBytes = cryptor.decrypt(encryptedBytes);
      const decryptedText = utf8.fromBytes(decryptBytes);
      decryptedText.should.equal(text);
    });

    it('CFB test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // The initialization vector (must be 16 bytes)
      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // Convert text to bytes (must be a multiple of the segment size you choose below)
      const text = 'TextMustBe16Byte';
      const textBytes = utf8.toBytes(text);

      // Create cryptor
      const segmentSize = 8;
      let cryptor = new Cryptor(Modes.CFB, { key, iv, segmentSize });

      // Encryption
      const encryptedBytes = cryptor.encrypt(textBytes);
      const encryptedHex = hex.fromBytes(encryptedBytes);
      encryptedHex.should.equal('60a6430b598820a8970ba5e4147cfc23');

      // The CFB mode maintains internal state, so to decrypt a new instance must be instantiated.
      cryptor = new Cryptor(Modes.CFB, { key, iv, segmentSize });

      // Decryption
      const decryptBytes = cryptor.decrypt(encryptedBytes);
      const decryptedText = utf8.fromBytes(decryptBytes);
      decryptedText.should.equal(text);
    });

    it('OFB test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // The initialization vector (must be 16 bytes)
      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // Convert text to bytes
      const text = 'Text may be any length you wish, no padding is required.';
      const textBytes = utf8.toBytes(text);

      // Create cryptor
      let cryptor = new Cryptor(Modes.OFB, { key, iv });

      // Encryption
      const encryptedBytes = cryptor.encrypt(textBytes);
      const encryptedHex = hex.fromBytes(encryptedBytes);
      encryptedHex.should.equal('60a6430b349032a5ca47853a638f1e076f59ed4dfbd51887fd02344a57ffd578df5260be82dece7be85cf9891b1813d0c7f595d314dbf028');

      // The OFB mode maintains internal state, so to decrypt a new instance must be instantiated.
      cryptor = new Cryptor(Modes.OFB, { key, iv });

      // Decryption
      const decryptBytes = cryptor.decrypt(encryptedBytes);
      const decryptedText = utf8.fromBytes(decryptBytes);
      decryptedText.should.equal(text);
    });

    it('CTR test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // Convert text to bytes
      const text = 'Text may be any length you wish, no padding is required.';
      const textBytes = utf8.toBytes(text);

      // Create cryptor
      let counter = new Counter(12);
      let cryptor = new Cryptor(Modes.CTR, { key, counter });

      // Encryption
      const encryptedBytes = cryptor.encrypt(textBytes);
      const encryptedHex = hex.fromBytes(encryptedBytes);
      encryptedHex.should.equal('fb7d0fd934f48f5f31b1ad9b297954ef1f02979f806669d7a15887332a7d0f7be63f1261e8c8cf10a46a6eed22f98a69fdb3aa237cc54be5');

      // The CTR mode maintains internal state, so to decrypt a new instance must be instantiated.
      counter = new Counter(12);
      cryptor = new Cryptor(Modes.CTR, { key, counter });

      // Decryption
      const decryptBytes = cryptor.decrypt(encryptedBytes);
      const decryptedText = utf8.fromBytes(decryptBytes);
      decryptedText.should.equal(text);
    });
  });

  describe('cryption with padding', () => {
    it('padding test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // Convert text to bytes
      const text = 'LessThan16Bytes';
      const textBytes = utf8.toBytes(text);

      // Create cryptor
      const padding = Padding.PKCS7;
      const cryptor = new Cryptor(Modes.ECB, { key, padding });

      // Encryption
      const encryptedBytes = cryptor.encrypt(textBytes);
      const encryptedHex = hex.fromBytes(encryptedBytes);
      encryptedHex.should.equal('23b4f080a310770e93def2ddfee44817');

      // Decryption
      const decryptBytes = cryptor.decrypt(encryptedBytes);
      const decryptedText = utf8.fromBytes(decryptBytes);
      decryptedText.should.equal(text);
    });
  });

  describe('cryption with string key', () => {
    it('length is not divisible by 16', () => {
      // An example string key
      const key = 'i_am_key';

      // Convert text to bytes
      const text = 'TextMustBe16Byte';
      const textBytes = utf8.toBytes(text);

      // Create cryptor
      const cryptor = new Cryptor(Modes.ECB, { key });

      // Encryption
      const encryptedBytes = cryptor.encrypt(textBytes);
      const encryptedHex = hex.fromBytes(encryptedBytes);
      encryptedHex.should.equal('c2914bd615668adecfc8440cab3a7e97');

      // Decryption
      const decryptBytes = cryptor.decrypt(encryptedBytes);
      const decryptedText = utf8.fromBytes(decryptBytes);
      decryptedText.should.equal(text);
    });
  });

  it('length is divisible by 16', () => {
    // An example string key
    const key = '1234567890123456';

    // Convert text to bytes
    const text = 'TextMustBe16Byte';
    const textBytes = utf8.toBytes(text);

    // Create cryptor
    const cryptor = new Cryptor(Modes.ECB, { key });

    // Encryption
    const encryptedBytes = cryptor.encrypt(textBytes);
    const encryptedHex = hex.fromBytes(encryptedBytes);
    encryptedHex.should.equal('3ba6941b0b398d96e87e34660ecd435f');

    // Decryption
    const decryptBytes = cryptor.decrypt(encryptedBytes);
    const decryptedText = utf8.fromBytes(decryptBytes);
    decryptedText.should.equal(text);
  });
});
