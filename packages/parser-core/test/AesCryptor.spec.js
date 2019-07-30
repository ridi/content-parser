import { should } from 'chai';

import AesCryptor, {
  Padding,
  Encoding,
  Mode,
} from '../src/AesCryptor';
import Errors from '../src/errors';

should(); // Initialize should

describe('AesCryptor', () => {
  describe('Initialize test', () => {
    it('Required parameter missing', () => {
      // mode missing
      try { new AesCryptor(); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }

      // config missing
      try { new AesCryptor(Mode.ECB); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }

      // key missing
      try { new AesCryptor(Mode.ECB, {}); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }

      // iv missing
      const key = 'i_am_key';
      try { new AesCryptor(Mode.CBC, { key }); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }
      try { new AesCryptor(Mode.CFB, { key }); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }
      try { new AesCryptor(Mode.OFB, { key }); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }

      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      try { new AesCryptor(Mode.CFB, { key, iv }); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }

      try { new AesCryptor(Mode.CTR, { key }); } catch (e) { e.code.should.equal(Errors.EREQPRM.code); }
    });

    it('Invalid parameter', () => {
      // Invalid mode
      try { new AesCryptor('ECB'); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }
      try { new AesCryptor({}); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Invalid key type
      try { new AesCryptor(Mode.ECB, { key: 36474145 }); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Invalid iv type
      let key = 'i_am_key';
      try { new AesCryptor(Mode.CBC, { key, iv: true }); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Invalid iv type
      try { new AesCryptor(Mode.CFB, { key, iv: true }); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Invalid iv type
      try { new AesCryptor(Mode.CTR, { key, iv: true }); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

      // Inavlid bytes type
      key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      try { new AesCryptor(Mode.ECB, { key }).encrypt(); } catch (e) { e.code.should.equal(Errors.ECRYT.code); }
      try { new AesCryptor(Mode.ECB, { key }).decrypt(); } catch (e) { e.code.should.equal(Errors.ECRYT.code); }
    });
  });

  describe('Cryption by mode', () => {
    it('ECB test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      const text = 'TextMustBe16Byte';
      const cryptor = new AesCryptor(Mode.ECB, { key });

      // Encryption
      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('a7d93b35368519fac347498dec18b458');

      // Decryption
      const encryptedBytes = cryptor.encrypt(text);
      cryptor.decrypt(encryptedBytes, { encoding: Encoding.UTF8 }).should.equal(text);

      // In addition to strings, Buffer and UInt8Array are also possible
      cryptor.encrypt(Buffer.from(text), { encoding: Encoding.HEX }).should.equal('a7d93b35368519fac347498dec18b458');
      cryptor.encrypt(new Uint8Array(Buffer.from(text)), { encoding: Encoding.HEX }).should.equal('a7d93b35368519fac347498dec18b458');
      cryptor.decrypt(cryptor.encrypt(text, { encoding: Encoding.UINT8 }), { encoding: Encoding.UTF8 }).should.equal(text);
    });

    it('CBC test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // The initialization vector (must be 16 bytes)
      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      const text = 'TextMustBe16Byte';
      let cryptor = new AesCryptor(Mode.CBC, { key, iv });

      // Encryption
      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('e5237e9a8938d805038ae117b4f8f53a');

      // The CBC mode maintains internal state, so to decrypt a new instance must be instantiated
      cryptor = new AesCryptor(Mode.CBC, { key, iv });

      // Decryption
      const encryptedBytes = cryptor.encrypt(text);
      cryptor.decrypt(encryptedBytes, { encoding: Encoding.UTF8 }).should.equal(text);
    });

    it('CFB test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // The initialization vector (must be 16 bytes)
      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      const text = 'TextMustBe16Byte';
      let cryptor = new AesCryptor(Mode.CFB, { key, iv });

      // Encryption
      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('60a6430b598820a8a840d12c40981342');

      // The CFB mode maintains internal state, so to decrypt a new instance must be instantiated
      cryptor = new AesCryptor(Mode.CFB, { key, iv });

      // Decryption
      const encryptedBytes = cryptor.encrypt(text);
      cryptor.decrypt(encryptedBytes, { encoding: Encoding.UTF8 }).should.equal(text);
    });

    it('OFB test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // The initialization vector (must be 16 bytes)
      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      const text = 'Text may be any length you wish, no padding is required.';
      let cryptor = new AesCryptor(Mode.OFB, { key, iv });

      // Encryption
      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('60a6430b349032a5ca47853a638f1e076f59ed4dfbd51887fd02344a57ffd578df5260be82dece7be85cf9891b1813d0c7f595d314dbf028');

      // The OFB mode maintains internal state, so to decrypt a new instance must be instantiated
      cryptor = new AesCryptor(Mode.OFB, { key, iv });

      // Decryption
      const encryptedBytes = cryptor.encrypt(text);
      cryptor.decrypt(encryptedBytes, { encoding: Encoding.UTF8 }).should.equal(text);
    });

    it('CTR test', () => {
      // An example 128-bit key
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      // The initialization vector (must be 16 bytes)
      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      const text = 'Text may be any length you wish, no padding is required.';
      let cryptor = new AesCryptor(Mode.CTR, { key, iv });

      // Encryption
      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('60a6430b349032a5ca47853a638f1e07ac648f72d1ccc58ea03602ac9d524732529b82d9329de027ac348b806a2da919d04f03e4545866e8');

      // The CTR mode maintains internal state, so to decrypt a new instance must be instantiated
      cryptor = new AesCryptor(Mode.CTR, { key, iv });

      // Decryption
      const encryptedBytes = cryptor.encrypt(text);
      cryptor.decrypt(encryptedBytes, { encoding: Encoding.UTF8 }).should.equal(text);
    });
  });

  describe('Cryption with padding', () => {
    it('PKCS7 test', () => {
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      const text = 'LessThan16Bytes';
      const cryptor = new AesCryptor(Mode.ECB, { key });

      const padding = Padding.PKCS7;
      cryptor.encrypt(text, { encoding: Encoding.HEX, padding }).should.equal('23b4f080a310770e93def2ddfee44817');

      const encryptedBytes = cryptor.encrypt(text, { padding });
      cryptor.decrypt(encryptedBytes, { encoding: Encoding.UTF8, padding }).should.equal(text);
    });

    it('AUTO test', () => {
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      const text = 'LessThan16Bytes';
      const cryptor = new AesCryptor(Mode.ECB, { key });

      const padding = Padding.AUTO;
      cryptor.encrypt(text, { encoding: Encoding.HEX, padding }).should.equal('23b4f080a310770e93def2ddfee44817');

      const encryptedBytes = cryptor.encrypt(text, { padding });
      cryptor.decrypt(encryptedBytes, { encoding: Encoding.UTF8, padding }).should.equal(text);
    });

    it('Handling damaged padding', () => {
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

      const cryptor = new AesCryptor(Mode.ECB, { key });

      const encryptedWordArray = Encoding.HEX.decode('23b4f080a310770e93def2ddfee44817');
      cryptor.decrypt(encryptedWordArray, { padding: Padding.PKCS7 }).should.not.null;
      encryptedWordArray.words[3] -= 5;
      try { cryptor.decrypt(encryptedWordArray, { padding: Padding.PKCS7 }); } catch (e) { e.code.should.equal(Errors.ECRYT.code); }
      encryptedWordArray.words[3] -= 0xff;
      try { cryptor.decrypt(encryptedWordArray, { padding: Padding.PKCS7 }); } catch (e) { e.code.should.equal(Errors.ECRYT.code); }

      cryptor.decrypt(encryptedWordArray, { padding: Padding.AUTO });
    });
  });

  describe('Cryption with string key', () => {
    it('Length is not divisible by 16', () => {
      // An example string key
      const key = 'i_am_key';

      const text = 'TextMustBe16Byte';
      const cryptor = new AesCryptor(Mode.ECB, { key });

      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('c2914bd615668adecfc8440cab3a7e97');

      const encryptedBytes = cryptor.encrypt(text);
      cryptor.decrypt(encryptedBytes, { encoding: Encoding.UTF8 }).should.equal(text);
    });

    it('Length is divisible by 16', () => {
      // An example string key
      const key = '1234567890123456';
  
      const text = 'TextMustBe16Byte';
      const cryptor = new AesCryptor(Mode.ECB, { key });
  
      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('3ba6941b0b398d96e87e34660ecd435f');
  
      const encryptedBytes = cryptor.encrypt(text);
      cryptor.decrypt(encryptedBytes, { encoding: Encoding.UTF8 }).should.equal(text);
    });
  });

  describe('Cryption with key as other type', () => {
    it('key as Buffer', () => {
      const key = Buffer.from('1234567890123456');
      const text = 'TextMustBe16Byte';
      const cryptor = new AesCryptor(Mode.ECB, { key });
      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('3ba6941b0b398d96e87e34660ecd435f');
    });

    it('key as UInt8Array', () => {
      const key = new Uint8Array(Buffer.from('1234567890123456'));
      const text = 'TextMustBe16Byte';
      const cryptor = new AesCryptor(Mode.ECB, { key });
      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('3ba6941b0b398d96e87e34660ecd435f');
    });
  });

  describe('Cryption with iv as other type', () => {
    it('iv as Buffer', () => {
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      const iv = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
      const text = 'TextMustBe16Byte';
      const cryptor = new AesCryptor(Mode.CBC, { key, iv });
      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('e5237e9a8938d805038ae117b4f8f53a');
    });

    it('iv as UInt8Array', () => {
      const key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      const iv = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      const text = 'TextMustBe16Byte';
      const cryptor = new AesCryptor(Mode.CBC, { key, iv });
      cryptor.encrypt(text, { encoding: Encoding.HEX }).should.equal('e5237e9a8938d805038ae117b4f8f53a');
    });
  });
});
