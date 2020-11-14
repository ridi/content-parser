abstract class BaseCryptor {
  abstract encrypt(data: string | Buffer | Uint8Array | number[]): string | Uint8Array;

  abstract decrypt(data: Buffer | Uint8Array | number[]): string | Uint8Array;
}
export default BaseCryptor;
