import { should } from 'chai';

import { Encoding, Hash } from '../lib/cryptoUtil';

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
      let expected = '6fd22ec41958931fed50569d4056e3bc';
      Hash.md5(value).should.equal(expected);
      Hash.md5(buffer).should.equal(expected);
      Hash.md5(wordArray).should.equal(expected);
      Hash.md5(array).should.equal(expected);

      expected = new Uint8Array([111, 210, 46, 196, 25, 88, 147, 31, 237, 80, 86, 157, 64, 86, 227, 188]);
      Hash.md5(value, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.md5(value, Encoding.BUFFER).equals(expected).should.be.true;
    });

    it('SHA1 test', () => {
      let expected = '5155c2f89973f9f9a15597f04ffb98d2c90eabe7';
      Hash.sha1(value).should.equal(expected);
      Hash.sha1(buffer).should.equal(expected);
      Hash.sha1(wordArray).should.equal(expected);
      Hash.sha1(array).should.equal(expected);

      expected = new Uint8Array([81, 85, 194, 248, 153, 115, 249, 249, 161, 85, 151, 240, 79, 251, 152, 210, 201, 14, 171, 231]);
      Hash.sha1(value, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.sha1(value, Encoding.BUFFER).equals(expected).should.be.true;
    });

    it('SHA2-224 test', () => {
      let expected = 'a0c9057e7c62e0cf04c2c08b2b798cd75315576b3baaf651f68fd21d';
      Hash.sha224(value).should.equal(expected);
      Hash.sha224(buffer).should.equal(expected);
      Hash.sha224(wordArray).should.equal(expected);
      Hash.sha224(array).should.equal(expected);

      expected = new Uint8Array([160, 201, 5, 126, 124, 98, 224, 207, 4, 194, 192, 139, 43, 121, 140, 215, 83, 21, 87, 107, 59, 170, 246, 81, 246, 143, 210, 29]);
      Hash.sha224(value, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.sha224(value, Encoding.BUFFER).equals(expected).should.be.true;
    });

    it('SHA2-256 test', () => {
      let expected = '11705f80ef18aea5245c4a40b831fa1421b148a24dd3a96edbaa1b0ebf9686e9';
      Hash.sha256(value).should.equal(expected);
      Hash.sha256(buffer).should.equal(expected);
      Hash.sha256(wordArray).should.equal(expected);
      Hash.sha256(array).should.equal(expected);

      expected = new Uint8Array([17, 112, 95, 128, 239, 24, 174, 165, 36, 92, 74, 64, 184, 49, 250, 20, 33, 177, 72, 162, 77, 211, 169, 110, 219, 170, 27, 14, 191, 150, 134, 233]);
      Hash.sha256(value, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.sha256(value, Encoding.BUFFER).equals(expected).should.be.true;
    });

    it('SHA2-384 test', () => {
      let expected = '941317ce71f87017defd9aad4944ce33b8d5f2d459d3ea08c6237b449124f7fc5350293a0503aeaf10d2334a5321ed75';
      Hash.sha384(value).should.equal(expected);
      Hash.sha384(buffer).should.equal(expected);
      Hash.sha384(wordArray).should.equal(expected);
      Hash.sha384(array).should.equal(expected);

      expected = new Uint8Array([148, 19, 23, 206, 113, 248, 112, 23, 222, 253, 154, 173, 73, 68, 206, 51, 184, 213, 242, 212, 89, 211, 234, 8, 198, 35, 123, 68, 145, 36, 247, 252, 83, 80, 41, 58, 5, 3, 174, 175, 16, 210, 51, 74, 83, 33, 237, 117]);
      Hash.sha384(value, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.sha384(value, Encoding.BUFFER).equals(expected).should.be.true;
    });

    it('SHA2-512 test', () => {
      let expected = 'a9e69838d8e5c19a74ce27923f448b51af2317cc3d60857e697710a5c71d8fd14ea4d79fd40fd21e4872261f9939d38085282e4a7db755e1862c4c21ca35a0e4';
      Hash.sha512(value).should.equal(expected);
      Hash.sha512(buffer).should.equal(expected);
      Hash.sha512(wordArray).should.equal(expected);
      Hash.sha512(array).should.equal(expected);

      expected = new Uint8Array([169, 230, 152, 56, 216, 229, 193, 154, 116, 206, 39, 146, 63, 68, 139, 81, 175, 35, 23, 204, 61, 96, 133, 126, 105, 119, 16, 165, 199, 29, 143, 209, 78, 164, 215, 159, 212, 15, 210, 30, 72, 114, 38, 31, 153, 57, 211, 128, 133, 40, 46, 74, 125, 183, 85, 225, 134, 44, 76, 33, 202, 53, 160, 228]);
      Hash.sha512(value, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.sha512(value, Encoding.BUFFER).equals(expected).should.be.true;
    });

    it('SHA3-224 (Keccak-224) test', () => {
      const size = 224;
      let expected = '2395060475f177e59840e287f889016d066961931f04824d0eac19c0';
      Hash.sha3(value, size).should.equal(expected);
      Hash.sha3(buffer, size).should.equal(expected);
      Hash.sha3(wordArray, size).should.equal(expected);
      Hash.sha3(array, size).should.equal(expected);

      expected = new Uint8Array([35, 149, 6, 4, 117, 241, 119, 229, 152, 64, 226, 135, 248, 137, 1, 109, 6, 105, 97, 147, 31, 4, 130, 77, 14, 172, 25, 192]);
      Hash.sha3(value, size, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.sha3(value, size, Encoding.BUFFER).equals(expected).should.be.true;
    });

    it('SHA3-256 (Keccak-256) test', () => {
      const size = 256;
      let expected = '0335a64014b2cf82a06a60b921c1fdaa0bf177f24aa7ef9ba71f7af2bb2a5c33';
      Hash.sha3(value, size).should.equal(expected);
      Hash.sha3(buffer, size).should.equal(expected);
      Hash.sha3(wordArray, size).should.equal(expected);
      Hash.sha3(array, size).should.equal(expected);

      expected = new Uint8Array([3, 53, 166, 64, 20, 178, 207, 130, 160, 106, 96, 185, 33, 193, 253, 170, 11, 241, 119, 242, 74, 167, 239, 155, 167, 31, 122, 242, 187, 42, 92, 51]);
      Hash.sha3(value, size, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.sha3(value, size, Encoding.BUFFER).equals(expected).should.be.true;
    });

    it('SHA3-384 (Keccak-384) test', () => {
      const size = 384;
      let expected = '76cb1747c6bb856a9160f01d6bc713400a631afea14e82d8f3f5244f05e6c66c2b704ba08dfb601e6779875ec9268f0b';
      Hash.sha3(value, size).should.equal(expected);
      Hash.sha3(buffer, size).should.equal(expected);
      Hash.sha3(wordArray, size).should.equal(expected);
      Hash.sha3(array, size).should.equal(expected);

      expected = new Uint8Array([118, 203, 23, 71, 198, 187, 133, 106, 145, 96, 240, 29, 107, 199, 19, 64, 10, 99, 26, 254, 161, 78, 130, 216, 243, 245, 36, 79, 5, 230, 198, 108, 43, 112, 75, 160, 141, 251, 96, 30, 103, 121, 135, 94, 201, 38, 143, 11]);
      Hash.sha3(value, size, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.sha3(value, size, Encoding.BUFFER).equals(expected).should.be.true;
    });

    it('SHA3-512 (Keccak-512) test', () => {
      let expected = 'a57c9ca83d331ca841a96a082a9bb3e167be470c0fd317802a125cfe8abf9e34f86413c8e9095dad3992963b66810ba44a7108c55056bb8bdc3a4bd04e4a7e79';
      Hash.sha3(value).should.equal(expected);
      Hash.sha3(buffer).should.equal(expected);
      Hash.sha3(wordArray).should.equal(expected);
      Hash.sha3(array).should.equal(expected);

      expected = new Uint8Array([165, 124, 156, 168, 61, 51, 28, 168, 65, 169, 106, 8, 42, 155, 179, 225, 103, 190, 71, 12, 15, 211, 23, 128, 42, 18, 92, 254, 138, 191, 158, 52, 248, 100, 19, 200, 233, 9, 93, 173, 57, 146, 150, 59, 102, 129, 11, 164, 74, 113, 8, 197, 80, 86, 187, 139, 220, 58, 75, 208, 78, 74, 126, 121]);
      Hash.sha3(value, 512, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.sha3(value, 512, Encoding.BUFFER).equals(expected).should.be.true;
    });

    it('RIPEMD160 test', () => {
      let expected = 'd3054d71d13ad4eb07ca6f0002da446c8888cc42';
      Hash.ripemd160(value).should.equal(expected);
      Hash.ripemd160(buffer).should.equal(expected);
      Hash.ripemd160(wordArray).should.equal(expected);
      Hash.ripemd160(array).should.equal(expected);

      expected = new Uint8Array([211, 5, 77, 113, 209, 58, 212, 235, 7, 202, 111, 0, 2, 218, 68, 108, 136, 136, 204, 66]);
      Hash.ripemd160(value, Encoding.UINT8).should.deep.equal(expected);

      expected = Buffer.from(expected);
      Hash.ripemd160(value, Encoding.BUFFER).equals(expected).should.be.true;
    });
  });
});
