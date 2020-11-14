/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * Get type as string
 */
export function getType(target: any, strict = false): string{
  const string = Object.prototype.toString.call(target).split(' ')[1];
  const type = string.substr(0, string.length - 1);
  if (strict) {
    if (type === 'Function') {
      return target.name;
    }
    if (type !== 'Null' && type !== 'Undefined') {
      return target.constructor.name;
    }
  }
  return type;
}
/**
 * Return true if passed argument is an array
 */
export function isArray(target: any): boolean {
  if (Array.isArray) {
    return Array.isArray(target);
  }
  return getType(target) === 'Array';
}
/**
 * Return true if passed argument is a boolean
 */
export function isBool(target: any): boolean {
  return getType(target) === 'Boolean';
}
/**
 * Return true if passed argument is undefined nor null
 */
export function isExists(target: any): boolean {
  return target !== undefined && target !== null;
}
/**
 * Return true if passed argument is function
 */
export function isFunc(target: any): boolean {
  return getType(target) === 'Function';
}

/**
 * Return true if passed argument is object
 */
export function isObject(target: any): boolean {
  return getType(target) === 'Object';
}

/**
 * Return true if passed argument is string
 */
export function isString(target: any): boolean {
  return typeof target === 'string';
}

/**
 * Return true if passed argument is url
 */
export function isUrl(string: string): boolean {
  return isString(string) && isExists(string.match(/[a-z].*?:\/\//i));
}
