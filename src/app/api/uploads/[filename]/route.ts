import fs from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';

const FILENAME_REGEX = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

function getUploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  if (!FILENAME_REGEX.test(filename)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const uploadDir = getUploadDir();
  const filePath = path.join(uploadDir, filename);

  try {
    const data = await fs.readFile(filePath);
    const ext = filename.split('.').pop();
    const contentType =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
