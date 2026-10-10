'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function loginStaff(username: string) {
  // Validate that the staff exists (case-insensitive)
  const staff = await prisma.staff.findFirst({
    where: { 
      username: { equals: username, mode: 'insensitive' }
    }
  });

  if (!staff) {
    return { success: false, error: "Invalid credentials. Staff not found." };
  }

  // In a real app we'd verify the password here.
  
  // Set auth cookie
  const cookieStore = await cookies();
  cookieStore.set('staffAuth', staff.username, { path: '/' });
  return { success: true };
}
