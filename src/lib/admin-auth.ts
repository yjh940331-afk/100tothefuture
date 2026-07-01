import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ttf_admin";
export const ADMIN_FAIL_COOKIE = "ttf_admin_fail";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours
export const ADMIN_LOGIN_WINDOW_SECONDS = 15 * 60;
export const ADMIN_LOGIN_MAX_FAILURES = 5;

export function adminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

function adminSessionSecret(): string | undefined {
  return process.env.ADMIN_SESSION_SECRET || adminPassword();
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmac(message: string): Promise<string | null> {
  const secret = adminSessionSecret();
  if (!secret) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

export async function createAdminSessionToken(now = Date.now()): Promise<string | null> {
  if (!adminSessionSecret()) return null;
  const expiresAt = now + ADMIN_SESSION_MAX_AGE * 1000;
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const payload = `${expiresAt}.${base64UrlEncode(nonceBytes)}`;
  const signature = await hmac(payload);
  if (!signature) return null;
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  now = Date.now(),
): Promise<boolean> {
  if (!token || !adminSessionSecret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expiresAtRaw, nonce, signature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < now || !nonce || !signature) {
    return false;
  }
  const expected = await hmac(`${expiresAtRaw}.${nonce}`);
  return Boolean(expected && expected === signature);
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminSessionToken(store.get(ADMIN_COOKIE)?.value);
}

export function parseLoginFailureCookie(value: string | undefined, now = Date.now()) {
  const empty = { count: 0, firstFailedAt: now };
  if (!value) return empty;
  const [countRaw, firstFailedAtRaw] = value.split(".");
  const count = Number(countRaw);
  const firstFailedAt = Number(firstFailedAtRaw);
  if (!Number.isFinite(count) || !Number.isFinite(firstFailedAt)) return empty;
  if (now - firstFailedAt > ADMIN_LOGIN_WINDOW_SECONDS * 1000) return empty;
  return { count, firstFailedAt };
}

export function serializeLoginFailureCookie(count: number, firstFailedAt: number): string {
  return `${count}.${firstFailedAt}`;
}
