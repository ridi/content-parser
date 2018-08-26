import StreamZip from 'node-stream-zip';

export default function openZip(target) {
  return new Promise((resolve) => {
    const zip = new StreamZip({ file: target });
    zip.on('ready', () => {
      resolve(zip);
    });
    zip.on('error', (err) => {
      throw err;
    });
  }).catch((err) => {
    throw err;
  });
}
