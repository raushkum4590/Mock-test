// Separate cookies so an admin console and a candidate session never collide
// on the same browser (e.g. an invigilator testing a candidate login).
export const ADMIN_COOKIE = "cbt_admin";
export const CANDIDATE_COOKIE = "cbt_candidate";
export const STUDENT_COOKIE = "cbt_student";
export const LANG_COOKIE = "cbt_lang";
// One-time token for the photo captured before the roll-number login.
export const PHOTO_COOKIE = "cbt_photo";
