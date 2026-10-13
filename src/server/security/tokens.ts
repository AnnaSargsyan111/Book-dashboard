import { createHash, randomBytes } from "node:crypto";

/** 256 bits of randomness, URL and cookie safe. */
export const generateToken = () => randomBytes(32).toString("base64url");

/** Tokens are only ever stored hashed, so a database leak does not reveal usable sessions or reset links. */
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
