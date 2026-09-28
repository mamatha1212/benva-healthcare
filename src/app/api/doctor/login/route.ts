import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { email: email.trim() }
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor account not found' }, { status: 404 });
    }

    let isFirstLogin = false;
    if (!doctor.password) {
      // First time login - set the password
      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { password } 
      });
      isFirstLogin = true;
    } else {
      // Verify existing password
      if (doctor.password !== password) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    // Set auth cookie
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'benva-super-secret-key-2026');
    const token = await new SignJWT({ id: doctor.id, email: doctor.email, name: doctor.name, role: 'doctor' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'doctor_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ success: true, isFirstLogin });
  } catch (error) {
    console.error('Doctor login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
