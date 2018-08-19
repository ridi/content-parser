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

export function objectMerge(obj1, obj2) {
  return Object.assign({}, obj1, obj2);
}

const tildeError = '\'~/\' was recognized as a directory name. '
  + 'If you want the correct behavior, should use \'process.env.HOME\'.';

export function createDirectory(target) {
  const components = target.split(path.sep);
  let current = '';
  if (target.startsWith(path.sep)) {
    current = path.sep;
  }
  if (target.startsWith('~')) {
    // eslint-disable-next-line no-console
    console.error(tildeError);
  }
  for (let idx = 0; idx < components.length; idx += 1) {
    current = path.join(current, components[idx]);
    if (!fs.existsSync(current)) {
      fs.mkdirSync(current);
    }
  }
}

export function removeDirectory(target) {
  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    if (target.startsWith('~')) {
      // eslint-disable-next-line no-console
      console.error(tildeError);
    }
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

export function removeLastPathComponent(target) {
  const components = target.split(path.sep);
  components.pop();
  if (target.startsWith(path.sep)) {
    return `${path.sep}${components.join(path.sep)}`;
  }
  return components.join(path.sep);
}

export function safePathJoin(...components) {
  if (components.findIndex(component => !isString(component)) >= 0) {
    return '';
  }
  return path.join(...components);
}

export function getPathes(target) {
  return fs.readdirSync(target).reduce((subpathes, subpath) => {
    const fullPath = path.join(target, subpath);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    return subpathes.concat(isDirectory ? getPathes(fullPath) : [fullPath]);
  }, []);
}
