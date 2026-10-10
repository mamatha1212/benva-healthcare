import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const token = process.env.PUBLIC_BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error("Missing PUBLIC_BLOB_READ_WRITE_TOKEN! You forgot to check the 'Add read-write token' box when creating the blob.");
    }

    const blob = await put(file.name, file, {
      access: 'public',
      token: token,
    });
    
    return NextResponse.json(blob);
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Server upload failed' }, { status: 500 });
  }
}
