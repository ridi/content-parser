/* eslint-disable import/prefer-default-export */
import es from 'event-stream';

import { isFunc } from './typecheck';

export function conditionally(condition, stream) {
  if (isFunc(condition) ? condition() : condition) {
    return stream;
  }
  return es.through(function write(data) {
    this.emit('data', data);
  });
}
