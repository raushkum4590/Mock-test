import { hash, verify } from "@node-rs/argon2";
import { randomInt } from "node:crypto";

// Argon2id with OWASP-recommended minimum parameters (19 MiB, t=2, p=1).
// `algorithm: 2` is Algorithm.Argon2id (a const enum, unusable under isolatedModules).
const OPTIONS = { algorithm: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export { MIN_ADMIN_PASSWORD_LENGTH, MIN_CANDIDATE_PASSWORD_LENGTH } from "./password-rules";

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

// A real hash to verify against when the account does not exist, so login
// timing does not reveal which usernames / roll numbers are valid.
let dummyHash: Promise<string> | null = null;
export async function verifyAgainstDummy(password: string): Promise<false> {
  dummyHash ??= hashPassword("dummy-password-for-timing");
  await verifyPassword(await dummyHash, password);
  return false;
}

// No ambiguous characters (0/O, 1/l/I) so printed passwords are easy to type.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generatePassword(length = 10): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
