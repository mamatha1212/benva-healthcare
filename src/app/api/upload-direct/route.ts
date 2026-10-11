import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const token = process.env.PUBLIC_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      try {
        const blob = await put(file.name, file, {
          access: 'public',
          token: token,
          addRandomSuffix: true,
        });
        
        return NextResponse.json({ ...blob, fileUrl: blob.url });
      } catch (blobErr) {
        console.warn('Vercel Blob upload failed, falling back to local file storage:', blobErr);
      }
    }

    // Local storage fallback for local dev or when token is not configured
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'prescriptions');
    await fs.mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = (file.name || 'image.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${safeName}`;
    const filePath = path.join(uploadsDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    const fileUrl = `/uploads/prescriptions/${fileName}`;
    return NextResponse.json({ url: fileUrl, fileUrl, name: file.name });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Server upload failed' }, { status: 500 });
  }
}
