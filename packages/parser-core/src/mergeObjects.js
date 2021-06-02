import { isExists, isObject } from './typecheck';
/**
 * Merge Objects
 * @param {T} obj1
 * @param {S} obj2
 * @returns {K} merged object
 * @template T,S,K
 */
export default function mergeObjects(obj1, obj2) {
  return [obj1, obj2].reduce((draft, obj) => {
    Object.keys(obj).forEach(key => {
      if (isObject(draft[key]) && isExists(obj[key])) {
        draft[key] = mergeObjects(draft[key], obj[key]);
      } else {
        draft[key] = obj[key];
      }
    });
    return draft;
  }, {});
}
