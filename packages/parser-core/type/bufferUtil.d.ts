/**
 * Removes all the leading non zero buffer chunk
 * @param {Buffer} buffer
 * @returns {Buffer} Trimmed buffer
 */
export function trimStart(buffer: Buffer): Buffer;
/**
 * Removes all the trailing non zero buffer chunk
 * @param {Buffer} buffer
 * @returns {Buffer} Trimmed buffer
 */
export function trimEnd(buffer: Buffer): Buffer;
/**
 * Trim a buffer
 * @param {Buffer} buffer
 * @returns {Buffer} Trimmed buffer
 */
export function trim(buffer: Buffer): Buffer;
