/**
 * Tests in these categories can be taken with just a name (no account).
 * A guest gets a throwaway student row whose email is on GUEST_EMAIL_DOMAIN;
 * guests can only start tests in these categories.
 */
export const GUEST_CATEGORY_SLUGS: readonly string[] = ["tally-prime", "web-development"];

export const GUEST_EMAIL_DOMAIN = "guest.edqity.local";

export const isGuestCategory = (slug: string | null | undefined) => !!slug && GUEST_CATEGORY_SLUGS.includes(slug);

export const isGuestEmail = (email: string) => email.toLowerCase().endsWith(`@${GUEST_EMAIL_DOMAIN}`);
