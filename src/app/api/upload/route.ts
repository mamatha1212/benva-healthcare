import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const lastDot = file.name.lastIndexOf('.');
    const ext = lastDot !== -1 ? file.name.substring(lastDot) : '.pdf';
    const filename = `${uniqueSuffix}${ext}`;
    
    // Upload the file to Vercel Blob
    const blob = await put(`${folder}/${filename}`, file, {
      access: 'public',
    });

    return NextResponse.json({ success: true, url: blob.url, name: file.name });
  } catch (error) {
    console.error('File upload error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
