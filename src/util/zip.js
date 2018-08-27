import StreamZip from 'node-stream-zip';

export default function openZip(target) {
  return new Promise((resolve, reject) => {
    const zip = new StreamZip({ file: target });
    zip.on('ready', () => {
      resolve(zip);
    });
    zip.on('error', (err) => {
      reject(err);
    });
  });
}
