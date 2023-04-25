/**
 * Get type as string
 */
export function getType(any: any, strict = false): string {
  const string = Object.prototype.toString.call(any).split(" ")[1];
  const type = string.substr(0, string.length - 1);
  if (strict) {
    if (type === "Function") {
      return any.name;
    }
    if (type !== "Null" && type !== "Undefined") {
      return any.constructor.name;
    }
  }
  return type;
}

/**
 * Return true if passed argument is an array
 */
export function isArray(any: any): any is any[] {
  if (Array.isArray) {
    return Array.isArray(any);
  }
  return getType(any) === "Array";
}

/**
 * Return true if passed argument is a boolean
 */
export function isBool(any: any): any is boolean {
  return getType(any) === "Boolean";
}

/**
 * Return true if passed argument is undefined nor null
 */
export function isExists<T>(any: any): any is NonNullable<T> {
  return any !== undefined && any !== null;
}

/**
 * Return true if passed argument is function
 */
export function isFunc(any: any): any is Function {
  return getType(any) === "Function";
}

/**
 * Return true if passed argument is object
 */
export function isObject(any: any): any is Record<any, any> {
  return getType(any) === "Object";
}

/**
 * Return true if passed argument is string
 */
export function isString(any: any): any is string {
  return typeof any === "string";
}

/**
 * Return true if passed argument is url
 */
export function isUrl(string: string) {
  return isString(string) && isExists(string.match(/[a-z].*?:\/\//i));
}
