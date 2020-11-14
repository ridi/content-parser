/**
 * Merge Objects
 */
export default function mergeObjects<T, S>(obj1: T, obj2: S): T & S {
  return {...obj1, ...obj2};
}
