/// <reference types="node" />
import * as es from 'event-stream';
import type { Readable } from 'stream';
/**
 * Apply event stream conditionally
 */
export declare function conditionally(this: Readable, condition: boolean | (() => boolean), stream: es.MapStream): es.MapStream;
