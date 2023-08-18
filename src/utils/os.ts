import { type KeyOfString, type UniqueString } from "./types";

type EnvKey = ProcessEnvCustomKeys | UniqueString<KeyOfString<NodeJS.ProcessEnv>>;

type DefaultEnsureEnvVar = <T extends primitive | primitive[] = string>(
  envKey: EnvKey,
  transformerOrDefaultValue?: T | ((envVar: string) => T),
  defaultValue?: T,
) => T;

type EnsureEnvVar = {
  <T extends primitive | primitive[] = string>(envKey: EnvKey): T;
  <T extends primitive | primitive[] = string>(envKey: EnvKey, defaultValue: T): T;
  <T extends primitive | primitive[] = string>(envKey: EnvKey, transformer: (envVar: string) => T): T;
  <T extends primitive | primitive[] = string>(envKey: EnvKey, transformer: (envVar: string) => T, defaultValue: T): T;
};
type primitive = boolean | number | string | null;

const ensureEnvVar_ = ((envKey, transformerOrDefaultValue_, defaultValue_) => {
  const envVar = process.env[envKey];
  const transformer =
    typeof transformerOrDefaultValue_ === "function" ? transformerOrDefaultValue_ : (_: string) => envVar;
  const defaultValue = typeof transformerOrDefaultValue_ !== "function" ? transformerOrDefaultValue_ : defaultValue_;
  if (typeof envVar === "undefined") {
    if (typeof defaultValue === "undefined") {
      throw new Error(`Some env var are not found.`, { cause: { envVar, transformer, defaultValue } });
    }

    return defaultValue;
  }

  return transformer(envVar) as never;
}) satisfies DefaultEnsureEnvVar;

export const ensureEnvVar = ensureEnvVar_ as EnsureEnvVar;
