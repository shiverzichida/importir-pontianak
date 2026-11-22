import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import type { AdminSessionUser, CustomerSessionUser } from './types';

export const ADMIN_COOKIE_NAME = 'imp_admin_session';
export const CUSTOMER_COOKIE_NAME = 'imp_customer_session';

const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const CUSTOMER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

interface AdminSessionPayload extends AdminSessionUser {
  scope?: 'admin' | 'customer';
  exp: number;
}

interface CustomerSessionPayload extends CustomerSessionUser {
  scope: 'customer';
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_SESSION_SECRET is missing or too short.');
    }
    return 'dev-only-importir-pontianak-secret-key';
  }
  return secret;
}

function signPayload(payload: object): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString(
    'base64url'
  );
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${sig}`;
}

function verifySignedPayload<T extends { exp?: number }>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, sig] = parts;
    if (!encodedPayload || !sig) return null;

    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(encodedPayload)
      .digest('base64url');

    const sigBuf = Buffer.from(sig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    const decoded = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as T;

    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [salt, storedHex] = parts;
  if (!salt || !storedHex) return false;
  try {
    const derived = crypto.scryptSync(plain, salt, 64);
    const storedBuf = Buffer.from(storedHex, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

export function createSessionToken(user: AdminSessionUser): string {
  const payload: AdminSessionPayload = {
    ...user,
    scope: 'admin',
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
  };
  return signPayload(payload);
}

export function verifySessionToken(token: string): AdminSessionUser | null {
  const decoded = verifySignedPayload<AdminSessionPayload>(token);
  if (!decoded) return null;
  // Strictly reject customer tokens if passed to admin endpoints
  if (decoded.scope === 'customer' || !decoded.userId) {
    return null;
  }
  return {
    userId: decoded.userId,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
  };
}

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function setAdminSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function createCustomerSessionToken(user: CustomerSessionUser): string {
  const payload: CustomerSessionPayload = {
    ...user,
    scope: 'customer',
    exp: Math.floor(Date.now() / 1000) + CUSTOMER_SESSION_TTL_SECONDS,
  };
  return signPayload(payload);
}

export function verifyCustomerSessionToken(
  token: string
): CustomerSessionUser | null {
  const decoded = verifySignedPayload<CustomerSessionPayload>(token);
  if (!decoded) return null;
  if (decoded.scope !== 'customer' || !decoded.customerId) {
    return null;
  }
  return {
    customerId: decoded.customerId,
    memberCode: decoded.memberCode,
    markingCodeBase: decoded.markingCodeBase,
    email: decoded.email,
    fullName: decoded.fullName,
    whatsapp: decoded.whatsapp,
    companyName: decoded.companyName ?? null,
    defaultDestinationCity: decoded.defaultDestinationCity,
  };
}

export async function getCustomerSession(): Promise<CustomerSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCustomerSessionToken(token);
}

export function setCustomerSessionCookie(
  res: NextResponse,
  token: string
): void {
  res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CUSTOMER_SESSION_TTL_SECONDS,
  });
}

export function clearCustomerSessionCookie(res: NextResponse): void {
  res.cookies.set(CUSTOMER_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Restricts post-auth redirects to safe internal application routes.
 */
export function sanitizeNextPath(
  nextRaw: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!nextRaw) return fallback;
  const trimmed = nextRaw.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/api')
  ) {
    return fallback;
  }
  return trimmed;
}
