/**
 * Validate option with interface. it will return void if it passes, throw error otherwise.
 * @param  {T} options
 * @param  {S} types
 * @param  {boolean} strict
 * @template T, S
 * @returns {void}
 */
export default function validateOptions<T, S>(options: T, types: S, strict?: boolean): void;
