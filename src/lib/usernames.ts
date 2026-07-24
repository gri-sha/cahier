// Usernames become URLs (cahier.fyi/username), so they share a namespace
// with the app's own routes — keep every current and plausible route here.
const RESERVED = new Set([
  "edit",
  "start",
  "api",
  "app",
  "www",
  "mail",
  "admin",
  "root",
  "cahier",
  "about",
  "help",
  "docs",
  "blog",
  "terms",
  "privacy",
  "settings",
  "account",
  "login",
  "logout",
  "signin",
  "signout",
  "static",
  "public",
  "assets",
  "vercel",
  "next",
  "null",
  "undefined",
]);

export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
export const USERNAME_MAX = 20;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

// Live sanitizer for the username input as the user types: keep only the
// characters a valid username can contain. Shared so the editor and the
// start flow can't drift apart.
export function sanitizeUsernameInput(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

// Returns an error message, or null when the username is acceptable.
export function usernameError(name: string): string | null {
  if (!USERNAME_PATTERN.test(name)) {
    return "3–20 characters: lowercase letters, digits, underscores";
  }
  if (RESERVED.has(name)) {
    return "that one is reserved";
  }
  return null;
}
