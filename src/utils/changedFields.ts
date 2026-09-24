// The subset of `keys` whose value differs between the two objects: the body
// of a partial PATCH, so a field the user never touched is not rewritten
// server-side. Empty when nothing changed.
export const changedFields = <T, K extends keyof T>(
  original: T,
  edited: T,
  keys: readonly K[],
) =>
  Object.fromEntries(
    keys.filter((key) => original[key] !== edited[key]).map((key) => [key, edited[key]]),
  ) as Partial<Pick<T, K>>;
