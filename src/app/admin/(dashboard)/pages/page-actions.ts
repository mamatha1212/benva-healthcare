'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createStaticPage(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const content = formData.get('content') as string;
  const isActive = formData.get('isActive') === 'on';

  if (!title || !slug) return;

  await prisma.staticPage.create({
    data: {
      title,
      slug,
      content,
      isActive,
    }
  });

  revalidatePath('/admin/(dashboard)/pages');
}

export async function updateStaticPage(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const content = formData.get('content') as string;
  const isActive = formData.get('isActive') === 'on';

  if (!title || !slug) return;

  await prisma.staticPage.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      isActive,
    }
  });

  revalidatePath('/admin/(dashboard)/pages');
}

export async function deleteStaticPage(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.staticPage.delete({
    where: { id }
  });

  revalidatePath('/admin/(dashboard)/pages');
}
