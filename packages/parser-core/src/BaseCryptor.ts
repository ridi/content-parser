abstract class BaseCryptor {
  abstract encrypt(data: string | Buffer | Uint8Array | ArrayBuffer | number[]): string | Promise<Buffer>;

  abstract decrypt(data: Buffer | Uint8Array | ArrayBuffer | number[]): string | Promise<Buffer>;
}
export default BaseCryptor;
