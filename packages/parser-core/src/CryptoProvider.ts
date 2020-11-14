import type BaseCryptor from './BaseCryptor';

export enum Purpose {
  READ_IN_ZIP= 'read_in_zip',
  READ_IN_DIR= 'read_in_dir',
  WRITE= 'write',
}

abstract class CryptoProvider {
  isStreamMode = true;

  abstract getCryptor(filePath: string, purpose: Purpose) : BaseCryptor

  abstract run(data: Buffer, filePath: string, purpose: Purpose): Promise<Buffer> | Buffer;

}

export default CryptoProvider;
