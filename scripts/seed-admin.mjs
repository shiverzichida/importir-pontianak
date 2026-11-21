import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

const email = (process.env.ADMIN_EMAIL || 'admin@importirpontianak.id').trim().toLowerCase();
const name = process.env.ADMIN_NAME || 'Admin Importir Pontianak';
const password = process.env.ADMIN_PASSWORD || 'ImportirPnk2026!';
const passwordHash = hashPassword(password);

const sql = `
INSERT INTO public.imp_admin_users (email, name, password_hash, role)
VALUES ('${email.replace(/'/g, "''")}', '${name.replace(/'/g, "''")}', '${passwordHash}', 'admin')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash;
`;

execSync('docker exec -i supabase-db psql -U postgres -d postgres', {
  input: sql,
  stdio: ['pipe', 'inherit', 'inherit'],
});

console.log(`Seeded admin user: ${email}`);
