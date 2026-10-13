const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Authentication policy: lifetimes and abuse limits. Change numbers here, nowhere else. */
export const AUTH_POLICY = {
  session: {
    ttlMs: 7 * DAY,
    /** The expiry slides forward at most once per this interval. */
    slideAfterMs: 24 * HOUR,
  },
  resetToken: { ttlMs: 60 * MINUTE },
  limits: {
    registerPerIp: { limit: 20, windowMs: HOUR },
    loginFailuresPerEmailAndIp: { limit: 5, windowMs: 15 * MINUTE },
    loginFailuresPerIp: { limit: 40, windowMs: 15 * MINUTE },
    forgotPerEmail: { limit: 3, windowMs: 15 * MINUTE },
    forgotPerIp: { limit: 10, windowMs: 15 * MINUTE },
    resetFailuresPerIp: { limit: 10, windowMs: 15 * MINUTE },
    /** A flat abuse cap, not an anti-brute-force limit: there is no currentPassword to brute-force here. */
    changePasswordPerUser: { limit: 10, windowMs: HOUR },
  },
} as const;

export const MAX_BODY_BYTES = 100_000;
