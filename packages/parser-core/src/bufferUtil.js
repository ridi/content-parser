export function trimStart(buffer) {
  let pos = 0;
  for (let i = 0; i <= buffer.length; i += 1) {
    if (buffer[i] !== 0x00) {
      pos = i;
      break;
    }
  }
  return buffer.slice(pos);
}

export function trimEnd(buffer) {
  let pos = 0;
  for (let i = buffer.length - 1; i >= 0; i -= 1) {
    if (buffer[i] !== 0x00) {
      pos = i;
      break;
    }
  }
  return buffer.slice(0, pos + 1);
}

export function trim(buffer) {
  return trimEnd(trimStart(buffer));
}
