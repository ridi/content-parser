import { should } from 'chai';

import { Encoding, Hash } from '../src/cryptoUtil';

should(); // Initialize should

describe('cryptoUtil', () => {
  describe('Encoding', () => {
    const value = '0123456789abcdef';
    const hex = '30313233343536373839616263646566';
    const array = Uint8Array.from([48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102]);
    const buffer = Buffer.from(array);

    it('UTF8 test', () => {
      const wordArray = Encoding.UTF8.decode(value);
      Encoding.UTF8.encode(wordArray).should.equal(value);
      Encoding.HEX.encode(wordArray).should.equal(hex);
      Encoding.UINT8.encode(wordArray).toString().should.equal(array.toString());
      Encoding.BUFFER.encode(wordArray).equals(buffer).should.be.true;
    });

    it('HEX test', () => {
      const wordArray = Encoding.HEX.decode(hex);
      Encoding.HEX.encode(wordArray).should.equal(hex);
      Encoding.UTF8.encode(wordArray).should.equal(value);
      Encoding.UINT8.encode(wordArray).toString().should.equal(array.toString());
      Encoding.BUFFER.encode(wordArray).equals(buffer).should.be.true;
    });

    it('UINT8 test', () => {
      const wordArray = Encoding.UINT8.decode(array);
      Encoding.UINT8.encode(wordArray).toString().should.equal(array.toString());
      Encoding.HEX.encode(wordArray).should.equal(hex);
      Encoding.UTF8.encode(wordArray).should.equal(value);
      Encoding.BUFFER.encode(wordArray).equals(buffer).should.be.true;
    });

    it('BUFFER test', () => {
      const wordArray = Encoding.BUFFER.decode(buffer);
      Encoding.BUFFER.encode(wordArray).equals(buffer).should.be.true;
      Encoding.UINT8.encode(wordArray).toString().should.equal(array.toString());
      Encoding.HEX.encode(wordArray).should.equal(hex);
      Encoding.UTF8.encode(wordArray).should.equal(value);
    });
  });

  describe('Hash', () => {
    const value = 'cryptoUtil';
    const buffer = Buffer.from(value);
    const wordArray = Encoding.BUFFER.decode(buffer);
    const array = Encoding.UINT8.encode(wordArray);

    it('MD5 test', () => {
      const expected = '6fd22ec41958931fed50569d4056e3bc';
      Hash.md5(value).should.equal(expected);
      Hash.md5(buffer).should.equal(expected);
      Hash.md5(wordArray).should.equal(expected);
      Hash.md5(array).should.equal(expected);
    });

    it('SHA1 test', () => {
      const expected = '5155c2f89973f9f9a15597f04ffb98d2c90eabe7';
      Hash.sha1(value).should.equal(expected);
      Hash.sha1(buffer).should.equal(expected);
      Hash.sha1(wordArray).should.equal(expected);
      Hash.sha1(array).should.equal(expected);
    });

    it('SHA2-224 test', () => {
      const expected = 'a0c9057e7c62e0cf04c2c08b2b798cd75315576b3baaf651f68fd21d';
      Hash.sha224(value).should.equal(expected);
      Hash.sha224(buffer).should.equal(expected);
      Hash.sha224(wordArray).should.equal(expected);
      Hash.sha224(array).should.equal(expected);
    });

    it('SHA2-256 test', () => {
      const expected = '11705f80ef18aea5245c4a40b831fa1421b148a24dd3a96edbaa1b0ebf9686e9';
      Hash.sha256(value).should.equal(expected);
      Hash.sha256(buffer).should.equal(expected);
      Hash.sha256(wordArray).should.equal(expected);
      Hash.sha256(array).should.equal(expected);
    });

    it('SHA2-384 test', () => {
      const expected = '941317ce71f87017defd9aad4944ce33b8d5f2d459d3ea08c6237b449124f7fc5350293a0503aeaf10d2334a5321ed75';
      Hash.sha384(value).should.equal(expected);
      Hash.sha384(buffer).should.equal(expected);
      Hash.sha384(wordArray).should.equal(expected);
      Hash.sha384(array).should.equal(expected);
    });

    it('SHA2-512 test', () => {
      const expected = 'a9e69838d8e5c19a74ce27923f448b51af2317cc3d60857e697710a5c71d8fd14ea4d79fd40fd21e4872261f9939d38085282e4a7db755e1862c4c21ca35a0e4';
      Hash.sha512(value).should.equal(expected);
      Hash.sha512(buffer).should.equal(expected);
      Hash.sha512(wordArray).should.equal(expected);
      Hash.sha512(array).should.equal(expected);
    });

    it('SHA3-224 (Keccak-224) test', () => {
      const size = 224;
      const expected = '2395060475f177e59840e287f889016d066961931f04824d0eac19c0';
      Hash.sha3(value, size).should.equal(expected);
      Hash.sha3(buffer, size).should.equal(expected);
      Hash.sha3(wordArray, size).should.equal(expected);
      Hash.sha3(array, size).should.equal(expected);
    });

    it('SHA3-256 (Keccak-256) test', () => {
      const size = 256;
      const expected = '0335a64014b2cf82a06a60b921c1fdaa0bf177f24aa7ef9ba71f7af2bb2a5c33';
      Hash.sha3(value, size).should.equal(expected);
      Hash.sha3(buffer, size).should.equal(expected);
      Hash.sha3(wordArray, size).should.equal(expected);
      Hash.sha3(array, size).should.equal(expected);
    });

    it('SHA3-384 (Keccak-384) test', () => {
      const size = 384;
      const expected = '76cb1747c6bb856a9160f01d6bc713400a631afea14e82d8f3f5244f05e6c66c2b704ba08dfb601e6779875ec9268f0b';
      Hash.sha3(value, size).should.equal(expected);
      Hash.sha3(buffer, size).should.equal(expected);
      Hash.sha3(wordArray, size).should.equal(expected);
      Hash.sha3(array, size).should.equal(expected);
    });

    it('SHA3-512 (Keccak-512) test', () => {
      const size = 512;
      const expected = 'a57c9ca83d331ca841a96a082a9bb3e167be470c0fd317802a125cfe8abf9e34f86413c8e9095dad3992963b66810ba44a7108c55056bb8bdc3a4bd04e4a7e79';
      Hash.sha3(value, size).should.equal(expected);
      Hash.sha3(buffer, size).should.equal(expected);
      Hash.sha3(wordArray, size).should.equal(expected);
      Hash.sha3(array, size).should.equal(expected);
    });

    it('RIPEMD160 test', () => {
      const expected = 'd3054d71d13ad4eb07ca6f0002da446c8888cc42';
      Hash.ripemd160(value).should.equal(expected);
      Hash.ripemd160(buffer).should.equal(expected);
      Hash.ripemd160(wordArray).should.equal(expected);
      Hash.ripemd160(array).should.equal(expected);
    });
  });
});
