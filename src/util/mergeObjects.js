import { isExists, isObject } from './typecheck';

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
