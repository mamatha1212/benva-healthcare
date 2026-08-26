'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- Categories ---

export async function addTestCategory(formData: FormData) {
  const name = formData.get('name') as string;
  
  if (!name) return;

  await prisma.testCategory.create({
    data: { name }
  });

  revalidatePath('/admin/tests');
}

export async function updateTestCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string;

  if (!name) return;

  await prisma.testCategory.update({
    where: { id },
    data: { name }
  });

  revalidatePath('/admin/tests');
}

export async function deleteTestCategory(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.testCategory.delete({
    where: { id }
  });

  revalidatePath('/admin/tests');
}

// --- Tests ---

export async function addTestItem(formData: FormData) {
  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;

  if (!name || !categoryId) return;

  await prisma.testItem.create({
    data: {
      name,
      categoryId
    }
  });

  revalidatePath('/admin/tests');
}

export async function updateTestItem(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  
  if (!name) return;

  await prisma.testItem.update({
    where: { id },
    data: { name }
  });

  revalidatePath('/admin/tests');
}

export async function deleteTestItem(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.testItem.delete({
    where: { id }
  });

  revalidatePath('/admin/tests');
}
