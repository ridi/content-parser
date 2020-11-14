import * as es from 'event-stream';
import type { Readable } from 'stream';
import { isFunc } from './typecheck';

/**
 * Apply event stream conditionally
 */
export function conditionally(this: Readable, condition: boolean | (() => boolean), stream:es.MapStream) : es.MapStream {
  if (isFunc(condition) ? (condition as (() => boolean))() : condition) {
    return stream;
  }
  return es.map((data: Buffer) => {
    this.emit('data', data);
  });
}
