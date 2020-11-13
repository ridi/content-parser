import * as es from 'event-stream';

/**
 * @param {number} start=0
 * @param {number} end=Infinity
 * @returns {es.MapStream}
 */
const createSliceStream = (start = 0, end = Infinity) => {
  let bytesReceived = 0;
  let finish = false;
  return es.map((chunk, callback) => { // eslint-disable-line
    bytesReceived += chunk.length;
    if (!finish && bytesReceived >= start) {
      if (start - (bytesReceived - chunk.length) > 0) {
        chunk = chunk.slice(start - (bytesReceived - chunk.length));
      }
      if (end <= bytesReceived) {
        callback(null, chunk.slice(0, chunk.length - (bytesReceived - end)));
        finish = true;
      } else {
        callback(null, chunk);
      }
    } else {
      callback();
    }
  });
};

export default createSliceStream;
