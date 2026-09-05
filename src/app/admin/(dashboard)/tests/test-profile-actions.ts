'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- Test Profiles ---

export async function createTestProfile(formData: FormData) {
  const name = formData.get('name') as string;
  if (!name) return;

  await prisma.testProfile.create({
    data: { name }
  });

  revalidatePath('/admin/(dashboard)/tests');
}

export async function updateTestProfile(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  if (!name) return;

  await prisma.testProfile.update({
    where: { id },
    data: { name }
  });

  revalidatePath('/admin/(dashboard)/tests');
}

export async function deleteTestProfile(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.testProfile.delete({
    where: { id }
  });

  revalidatePath('/admin/(dashboard)/tests');
}

// --- Test Parameters ---

export async function addTestParameter(formData: FormData) {
  const profileId = formData.get('profileId') as string;
  const name = formData.get('name') as string;
  if (!profileId || !name) return;

  await prisma.testParameter.create({
    data: { name, profileId }
  });

  revalidatePath('/admin/(dashboard)/tests');
}

export async function updateTestParameter(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  if (!name) return;

  await prisma.testParameter.update({
    where: { id },
    data: { name }
  });

  revalidatePath('/admin/(dashboard)/tests');
}

export async function deleteTestParameter(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.testParameter.delete({
    where: { id }
  });

  revalidatePath('/admin/(dashboard)/tests');
}

// --- Package Links ---

export async function toggleProfileInPackage(packageId: string, profileId: string, isLinked: boolean) {
  if (isLinked) {
    // Unlink
    await prisma.healthPackage.update({
      where: { id: packageId },
      data: {
        profiles: {
          disconnect: { id: profileId }
        }
      }
    });
  } else {
    // Link
    await prisma.healthPackage.update({
      where: { id: packageId },
      data: {
        profiles: {
          connect: { id: profileId }
        }
      }
    });
  }

  revalidatePath('/admin/(dashboard)/tests');
  revalidatePath('/health-checkups');
}
