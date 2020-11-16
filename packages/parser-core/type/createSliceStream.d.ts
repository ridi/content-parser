import * as es from 'event-stream';
declare const createSliceStream: (start?: number, end?: number) => es.MapStream;
export default createSliceStream;
