type WordArray = CryptoJS.lib.WordArray;
interface Cipher {
  /**
   * This cipher's key size. Default: 4 (128 bits)
   */
  keySize: number;
  /**
   * This cipher's IV size. Default: 4 (128 bits)
   */
  ivSize: number;
  /**
   * A constant representing encryption mode.
   */
  readonly _ENC_XFORM_MODE: number;
  /**
   * A constant representing decryption mode.
   */
  readonly _DEV_XFORM_MODE: number;

  /**
   * Resets this cipher to its initial state.
   *
   * @example
   *
   *     cipher.reset();
   */
  reset(): void;

  /**
   * Adds data to be encrypted or decrypted.
   *
   * @param dataUpdate The data to encrypt or decrypt.
   *
   * @return The data after processing.
   *
   * @example
   *
   *     var encrypted = cipher.process('data');
   *     var encrypted = cipher.process(wordArray);
   */
  process(dataUpdate: WordArray | string): WordArray;

  /**
   * Finalizes the encryption or decryption process.
   * Note that the finalize operation is effectively a destructive, read-once operation.
   *
   * @param dataUpdate The final data to encrypt or decrypt.
   *
   * @return The data after final processing.
   *
   * @example
   *
   *     var encrypted = cipher.finalize();
   *     var encrypted = cipher.finalize('data');
   *     var encrypted = cipher.finalize(wordArray);
   */
  finalize(dataUpdate?: WordArray | string): WordArray;
}
interface ModeStatic {
  /**
   * Initializes a newly created mode.
   *
   * @param cipher A block cipher instance.
   * @param iv The IV words.
   *
   * @example
   *
   *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
   */
  create(cipher: Cipher, iv: number[]): Mode;
}
/**
 * Abstract base block cipher mode template.
 */
export interface BlockCipherMode {
  Encryptor: ModeStatic;
  Decryptor: ModeStatic;
  /**
   * Creates this mode for encryption.
   *
   * @param cipher A block cipher instance.
   * @param iv The IV words.
   *
   * @example
   *
   *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
   */
  createEncryptor(cipher: Cipher, iv: number[]): Mode;

  /**
   * Creates this mode for decryption.
   *
   * @param cipher A block cipher instance.
   * @param iv The IV words.
   *
   * @example
   *
   *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
   */
  createDecryptor(cipher: Cipher, iv: number[]): Mode;
}

interface Mode {
  /**
   * Processes the data block at offset.
   *
   * @param words The data words to operate on.
   * @param offset The offset where the block starts.
   *
   * @example
   *
   *     mode.processBlock(data.words, offset);
   */
  processBlock(words: number[], offset: number): void;
}
