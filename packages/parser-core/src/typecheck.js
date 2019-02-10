export function getType(any, strict = false) {
  const string = Object.prototype.toString.call(any).split(' ')[1];
  const type = string.substr(0, string.length - 1);
  if (strict) {
    if (type === 'Function') {
      return any.name;
    }
    if (type !== 'Null' && type !== 'Undefined') {
      return any.constructor.name;
    }
  }
  return type;
}

export function isArray(any) {
  if (Array.isArray) {
    return Array.isArray(any);
  }
  return getType(any) === 'Array';
}

export function isBool(any) {
  return getType(any) === 'Boolean';
}

export function isExists(any) {
  return any !== undefined && any !== null;
}

export function isFunc(any) {
  return getType(any) === 'Function';
}

export function isObject(any) {
  return getType(any) === 'Object';
}

export function isString(any) {
  return typeof any === 'string';
}

export function isUrl(string) {
  return isString(string) && isExists(string.match(/[a-z].*?:\/\//i));
}
