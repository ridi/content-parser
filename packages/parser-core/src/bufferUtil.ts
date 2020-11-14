/**
 * Removes all the leading non zero buffer chunk
 */
export function trimStart(buffer: Buffer): Buffer {
  let pos = 0;
  for (let i = 0; i <= buffer.length; i += 1) {
    if (buffer[i] !== 0x00) {
      pos = i;
      break;
    }
  }
  return buffer.slice(pos);
}

/**
 * Removes all the trailing non zero buffer chunk
 */
export function trimEnd(buffer: Buffer): Buffer {
  let pos = 0;
  for (let i = buffer.length - 1; i >= 0; i -= 1) {
    if (buffer[i] !== 0x00) {
      pos = i;
      break;
    }
  }
  return buffer.slice(0, pos + 1);
}

/**
 * Trim a buffer
 */
export function trim(buffer: Buffer): Buffer {
  return trimEnd(trimStart(buffer));
}
