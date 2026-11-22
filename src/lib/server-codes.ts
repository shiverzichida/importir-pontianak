import crypto from 'node:crypto';
import type { OriginCountry } from './types';

export function generateRfqCode(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = crypto.randomInt(1000, 9999);
  return `RFQ-PNK-${yy}${mm}-${rand}`;
}

export function generateTrackingNumber(): string {
  const yyyy = new Date().getFullYear();
  const suffix = crypto.randomInt(1000, 9999);
  const alpha = crypto.randomBytes(1).toString('hex').toUpperCase();
  return `IMP-PNK-${yyyy}-${suffix}${alpha}`;
}

export function generateMarkingCode(origin: OriginCountry, name: string): string {
  const prefix = origin === 'china' ? 'CN' : origin === 'malaysia' ? 'MY' : 'SG';
  const cleaned = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5)
    .padEnd(3, 'X');
  const num = crypto.randomInt(10, 99);
  return `PNK-${prefix}-${cleaned}${num}`;
}

export function generateMemberCode(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = crypto.randomInt(1000, 9999);
  return `MBR-PNK-${yy}${mm}-${rand}`;
}

export function generateMarkingCodeBase(name: string): string {
  const cleaned = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5)
    .padEnd(3, 'X');
  const num = crypto.randomInt(100, 999);
  return `${cleaned}${num}`;
}

export function formatCustomerMarkingCode(
  origin: OriginCountry,
  markingCodeBase: string
): string {
  const prefix = origin === 'china' ? 'CN' : origin === 'malaysia' ? 'MY' : 'SG';
  const cleanBase = markingCodeBase.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `PNK-${prefix}-${cleanBase}`;
}
