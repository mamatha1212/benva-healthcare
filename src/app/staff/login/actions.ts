'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function loginStaff(username: string) {
  // Validate that the staff exists
  const staff = await prisma.staff.findFirst({
    where: { username }
  });

  if (!staff) {
    throw new Error("Invalid credentials");
  }

  // In a real app we'd verify the password here.
  
  // Set auth cookie
  const cookieStore = await cookies();
  cookieStore.set('staffAuth', username, { path: '/' });
  return { success: true };
}
