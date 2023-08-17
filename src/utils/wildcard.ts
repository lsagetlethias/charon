/**
 * Converts a wildcard string to a regular expression.
 *
 * @todo maybe use a dedicated library for this?
 */
export function wildcardToRegex(wildcard: string): RegExp {
  const escapedWildcard = wildcard.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const regexString = escapedWildcard.replace(/\*/g, ".*");
  return new RegExp(`^${regexString}`);
}
