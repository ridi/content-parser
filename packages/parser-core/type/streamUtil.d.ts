/**
 * Apply event stream conditionally
 * @param {boolean | (()=>boolean)} condition
 * @param {es.MapStream} stream
 * @returns {es.MapStream} Mapstream
 */
export function conditionally(condition: boolean | (() => boolean), stream: es.MapStream): es.MapStream;
import * as es from "event-stream";
