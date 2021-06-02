import * as es from 'event-stream';

import { isFunc } from './typecheck';

/**
 * Apply event stream conditionally
 * @param {boolean | (()=>boolean)} condition
 * @param {es.MapStream} stream
 * @returns {es.MapStream} Mapstream
 */
export function conditionally(condition, stream) {
  if (isFunc(condition) ? condition() : condition) {
    return stream;
  }
  return es.through(function write(data) {
    this.emit('data', data);
  });
}
