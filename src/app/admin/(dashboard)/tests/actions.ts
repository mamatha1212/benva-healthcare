'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- Tests ---

export async function addTestItem(formData: FormData) {
  const name = formData.get('name') as string;
  const parameters = formData.get('parameters') as string;
  const packageId = formData.get('packageId') as string;

  if (!name || !parameters || !packageId) return;

  await prisma.packageTest.create({
    data: {
      name,
      parameters,
      packageId
    }
  });

  revalidatePath('/admin/tests');
}

export async function updateTestItem(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const parameters = formData.get('parameters') as string;
  
  if (!name || !parameters) return;

  await prisma.packageTest.update({
    where: { id },
    data: { name, parameters }
  });

  revalidatePath('/admin/tests');
}

export async function deleteTestItem(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.packageTest.delete({
    where: { id }
  });

  revalidatePath('/admin/tests');
}
