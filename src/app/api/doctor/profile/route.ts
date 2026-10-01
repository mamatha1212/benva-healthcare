import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'benva-super-secret-key-2026';

async function getDoctorFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('doctor_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload; // Should contain id, email, role, etc.
  } catch (e) {
    return null;
  }
}

export async function GET() {
  const doctorPayload = await getDoctorFromToken();
  if (!doctorPayload || doctorPayload.role !== 'doctor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorPayload.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        type: true,
        qualification: true,
        speciality: true,
        medicalCouncilReg: true,
        signature: true,
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const doctorPayload = await getDoctorFromToken();
  if (!doctorPayload || doctorPayload.role !== 'doctor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      phone,
      qualification,
      speciality,
      medicalCouncilReg,
      signature
    } = body;

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorPayload.id as string },
      data: {
        name,
        phone,
        qualification,
        speciality,
        medicalCouncilReg,
        signature
      },
    });

    return NextResponse.json({ success: true, doctor: updatedDoctor });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
