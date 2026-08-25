'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';

function generateSlug(title: string) {
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const uniqueId = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${uniqueId}`;
}

export async function addPackage(formData: FormData) {
  const title = formData.get('title') as string;
  const subtitle = formData.get('subtitle') as string;
  const price = formData.get('price') as string;
  const originalPrice = formData.get('originalPrice') as string;
  const discount = formData.get('discount') as string;
  const theme = formData.get('theme') as string;
  const layout = formData.get('layout') as string;
  const isPopular = formData.get('isPopular') === 'on';

  const imageFile = formData.get('imageFile') as File | null;
  let imagePath = '';

  if (imageFile && imageFile.name && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(process.cwd(), 'public', 'images', 'packages', uniqueFilename);
    
    await writeFile(filePath, buffer);
    imagePath = `/images/packages/${uniqueFilename}`;
  }

  await prisma.healthPackage.create({
    data: {
      title,
      subtitle,
      price,
      originalPrice,
      discount,
      theme,
      image: imagePath,
      layout,
      isPopular,
      slug: generateSlug(title)
    }
  });

  revalidatePath('/admin/packages');
  revalidatePath('/health-packages');
}

export async function updatePackage(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const subtitle = formData.get('subtitle') as string;
  const price = formData.get('price') as string;
  const originalPrice = formData.get('originalPrice') as string;
  const discount = formData.get('discount') as string;
  const theme = formData.get('theme') as string;
  const layout = formData.get('layout') as string;
  const isPopular = formData.get('isPopular') === 'on';

  const imageFile = formData.get('imageFile') as File | null;
  let imagePath = undefined;

  if (imageFile && imageFile.name && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(process.cwd(), 'public', 'images', 'packages', uniqueFilename);
    
    await writeFile(filePath, buffer);
    imagePath = `/images/packages/${uniqueFilename}`;
  }

  await prisma.healthPackage.update({
    where: { id },
    data: {
      title,
      subtitle,
      price,
      originalPrice,
      discount,
      theme,
      layout,
      isPopular,
      slug: generateSlug(title),
      ...(imagePath && { image: imagePath })
    }
  });

  revalidatePath('/admin/packages');
  revalidatePath('/health-packages');
}

export async function deletePackage(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.healthPackage.delete({ where: { id } });
  revalidatePath('/admin/packages');
  revalidatePath('/health-packages');
}
