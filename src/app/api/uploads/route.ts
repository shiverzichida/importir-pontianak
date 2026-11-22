import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getActiveCustomerProfile } from '@/lib/customer-data';

const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3 MB

function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
}

function detectImageExtension(buf: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'jpg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: RIFF....WEBP
  if (
    buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buf.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const [adminSession, customerProfile] = await Promise.all([
      getAdminSession(),
      getActiveCustomerProfile(),
    ]);

    if (!adminSession && !customerProfile) {
      return NextResponse.json(
        { error: 'Silakan login terlebih dahulu untuk mengunggah file.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'File foto produk tidak ditemukan.' },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 3 MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = detectImageExtension(buffer);

    if (!ext) {
      return NextResponse.json(
        { error: 'Format file harus JPG, PNG, atau WebP yang valid.' },
        { status: 400 }
      );
    }

    const uploadDir = getUploadDir();
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${crypto.randomUUID()}.${ext}`;
    const targetPath = path.join(uploadDir, filename);
    await fs.writeFile(targetPath, buffer);

    return NextResponse.json(
      { url: `/api/uploads/${filename}`, filename },
      { status: 201 }
    );
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Gagal menyimpan file foto.' },
      { status: 500 }
    );
  }
}
