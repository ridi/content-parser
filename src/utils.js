/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import path from 'path';

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

export function createDirectory(target) {
  const components = target.split(path.sep);
  let current = '';
  for (let idx = 0; idx < components.length; idx += 1) {
    current = path.join(current, components[idx]);
    if (!fs.existsSync(current)) {
      fs.mkdirSync(current);
    }
  }
}

export function removeDirectory(target) {
  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    fs.readdirSync(target).forEach((subpath) => {
      const current = path.join(target, subpath);
      if (fs.lstatSync(current).isDirectory()) {
        removeDirectory(current);
      } else {
        fs.unlinkSync(current);
      }
    });
    fs.rmdirSync(target);
  }
}
