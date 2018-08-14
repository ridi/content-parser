/* eslint-disable import/prefer-default-export */

export function getPropertyDescriptor(any, key) {
  return Object.getOwnPropertyDescriptor(any, key);
}

export function getPropertyKeys(any) {
  return Object.getOwnPropertyNames(any);
}

export function isArray(any) {
  if (Array.isArray) {
    return Array.isArray(any);
  }
  return Object.prototype.toString.call(any) === '[object Array]';
}

export function isBuffer(any) {
  return Buffer.isBuffer(any);
}

export function isObject(any) {
  return Object.prototype.toString.call(any) === '[object Object]';
}

export function isExists(any) {
  return any !== undefined && any !== null;
}

export function isString(any) {
  return typeof any === 'string';
}

export function objectMerge(obj1, obj2) {
  return Object.assign({}, obj1, obj2);
}
