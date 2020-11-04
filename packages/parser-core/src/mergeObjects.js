import { isExists, isObject } from './typecheck';
/**
 * Merge Objects
 * @param  {T} obj1
 * @param  {S} obj2
 * @returns {K} merged object
 * @template T,S,K
 */
export default function mergeObjects(obj1, obj2) {
  return [obj1, obj2].reduce((merged, obj) => {
    Object.keys(obj).forEach((key) => {
      if (isObject(merged[key]) && isExists(obj[key])) {
        merged[key] = mergeObjects(merged[key], obj[key]);
      } else {
        merged[key] = obj[key];
      }
    });
    return merged;
  }, {});
}
