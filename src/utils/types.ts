/**
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any;

/**
 * Hack for union string litteral with string to keep autocomplete.
 *
 * Can be used in mapped type that output unwanted discriminated unions.
 *
 * @example
 * ```ts
 * type Discr = "A" | "B";
 * type DiscrMap = {
 *  "A": "alpha" | "beta",
 *  "B": "beta" | "gamma"
 * }
 * type T1 = {
 *  [P in Discr]: {
 *    discr: P,
 *    prop: DiscrMap[P];
 *  }
 * }[Discr];
 * type T2 = {
 *  [P in Discr]: {
 *    discr: P,
 *    prop: UniqueString<DiscrMap[P]> | DiscrMap[P]; // first part makes unique the litterals, second ensure autocomplete
 *  }
 * }[Discr];
 *
 * const bad: T1 = {
 *  discr: "A",
 *  prop: "gamma" // typed and autocomplete with `"alpha" | "beta" | "gama"`. Bad DX but still type safe.
 * }
 * const good: T2 = {
 *   discr: "A",
 *   prop: "alpha", // typed, autocompleted, and type safed with `"alpha" | "beta"`
 * };
 * ```
 */
export type UniqueString<TStr extends string = string> = TStr & {
  _?: never;
};

export type UnknownMapping = UniqueString<string>;

export type KeyOfString<TObj> = Extract<keyof TObj, string>;
