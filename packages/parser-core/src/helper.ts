export type ValueOf<T> = T extends Record<any, infer Value> ? Value : T;
