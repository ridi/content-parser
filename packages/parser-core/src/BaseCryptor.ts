abstract class BaseCryptor {
  abstract encrypt(data: string | Buffer | Uint8Array | ArrayBuffer | number[]): string | Uint8Array | Promise<Buffer>;

  abstract decrypt(data: Buffer | Uint8Array | ArrayBuffer | number[]): string | Uint8Array | Promise<Buffer>;
}
export default BaseCryptor;
