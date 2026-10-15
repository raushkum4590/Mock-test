// Kept separate from password.ts so client-side forms can import the rules
// without pulling the native argon2 module into the browser bundle.
export const MIN_ADMIN_PASSWORD_LENGTH = 10;
export const MIN_CANDIDATE_PASSWORD_LENGTH = 6;
