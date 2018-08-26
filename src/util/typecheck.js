export function getType(any) {
  const string = Object.prototype.toString.call(any).split(' ')[1];
  return string.substr(0, string.length - 1);
}

export function isArray(any) {
  if (Array.isArray) {
    return Array.isArray(any);
  }
  return Object.prototype.toString.call(any) === '[object Array]';
}

export function isExists(any) {
  return any !== undefined && any !== null;
}

export function isObject(any) {
  return Object.prototype.toString.call(any) === '[object Object]';
}

export function isString(any) {
  return typeof any === 'string';
}

export function isUrl(string) {
  return isString(string) && isExists(string.match(/(http|https):\/\//i));
}
