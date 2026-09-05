'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// --- States ---

export async function addState(formData: FormData) {
  const name = formData.get('name') as string;
  
  if (!name) return;

  await prisma.state.create({
    data: { name }
  });

  revalidatePath('/admin/locations');
}

export async function updateState(id: string, formData: FormData) {
  const name = formData.get('name') as string;

  if (!name) return;

  await prisma.state.update({
    where: { id },
    data: { name }
  });

  revalidatePath('/admin/locations');
}

export async function deleteState(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.state.delete({
    where: { id }
  });

  revalidatePath('/admin/locations');
}

// --- Districts ---

export async function addDistrict(formData: FormData) {
  const name = formData.get('name') as string;
  const stateId = formData.get('stateId') as string;
  
  if (!name || !stateId) return;

  await prisma.district.create({
    data: { name, stateId }
  });

  revalidatePath('/admin/locations');
}

export async function updateDistrict(id: string, formData: FormData) {
  const name = formData.get('name') as string;

  if (!name) return;

  await prisma.district.update({
    where: { id },
    data: { name }
  });

  revalidatePath('/admin/locations');
}

export async function deleteDistrict(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.district.delete({
    where: { id }
  });

  revalidatePath('/admin/locations');
}

// --- Areas ---

export async function addArea(formData: FormData) {
  const name = formData.get('name') as string;
  const districtId = formData.get('districtId') as string;

  if (!name || !districtId) return;

  await prisma.area.create({
    data: {
      name,
      districtId
    }
  });

  revalidatePath('/admin/locations');
}

export async function updateArea(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  
  if (!name) return;

  await prisma.area.update({
    where: { id },
    data: { name }
  });

  revalidatePath('/admin/locations');
}

export async function deleteArea(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.area.delete({
    where: { id }
  });

  revalidatePath('/admin/locations');
}
