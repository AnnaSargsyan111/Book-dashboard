import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id (the library default) with the OWASP-recommended minimum cost: 19 MiB memory, 2 passes, 1 lane.
 * The parameters are embedded in each stored hash, so raising them later needs no migration.
 */
const OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

const normalize = (password: string) => password.normalize("NFKC");

export function hashPassword(password: string): Promise<string> {
  return hash(normalize(password), OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, normalize(password));
  } catch {
    return false; // malformed hash must never behave as a match
  }
}

let dummyHash: Promise<string> | undefined;

/**
 * Spend the same time as a real verification. Used when the account does not exist so that "unknown email" and
 * "wrong password" cannot be told apart by response time.
 */
export async function verifyAgainstDummy(password: string): Promise<void> {
  dummyHash ??= hashPassword("mystbook-timing-equalizer");
  await verifyPassword(await dummyHash, password);
}
