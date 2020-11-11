export default createSliceStream;
/**
 * @param {number} start=0
 * @param {number} end=Infinity
 * @returns {es.MapStream}
 */
declare function createSliceStream(start?: number, end?: number): es.MapStream;
import * as es from "event-stream";
