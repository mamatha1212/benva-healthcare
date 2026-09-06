'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addDietPlan(formData: FormData) {
  const title = formData.get('title') as string;
  const duration = formData.get('duration') as string;
  const price = formData.get('price') as string;
  const priceUnit = formData.get('priceUnit') as string;
  const isActive = formData.get('isActive') === 'on';
  
  // Parse dynamic benefits array
  const benefits = [];
  let i = 0;
  while (formData.has(`benefit_${i}`)) {
    const name = formData.get(`benefit_${i}`) as string;
    if (name) {
      benefits.push({ name, order: i });
    }
    i++;
  }

  await prisma.dietPlan.create({
    data: {
      title,
      duration,
      price,
      priceUnit,
      isActive,
      benefits: {
        create: benefits,
      },
    }
  });

  revalidatePath('/admin/diet-plans');
  revalidatePath('/admin/diet-plans/benefits');
  revalidatePath('/diet-plan');
}

export async function updateDietPlan(formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const duration = formData.get('duration') as string;
  const price = formData.get('price') as string;
  const priceUnit = formData.get('priceUnit') as string;
  const isActive = formData.get('isActive') === 'on';

  // Parse dynamic benefits array
  const benefits = [];
  let i = 0;
  while (formData.has(`benefit_${i}`)) {
    const name = formData.get(`benefit_${i}`) as string;
    if (name) {
      benefits.push({ name, order: i });
    }
    i++;
  }

  // Delete existing benefits and create new ones
  await prisma.dietPlanBenefit.deleteMany({
    where: { dietPlanId: id }
  });

  await prisma.dietPlan.update({
    where: { id },
    data: {
      title,
      duration,
      price,
      priceUnit,
      isActive,
      benefits: {
        create: benefits,
      },
    }
  });

  revalidatePath('/admin/diet-plans');
  revalidatePath('/admin/diet-plans/benefits');
  revalidatePath('/diet-plan');
  redirect('/admin/diet-plans');
}

export async function deleteDietPlan(formData: FormData) {
  const id = formData.get('id') as string;

  await prisma.dietPlan.delete({
    where: { id }
  });

  revalidatePath('/admin/diet-plans');
  revalidatePath('/admin/diet-plans/benefits');
  revalidatePath('/diet-plan');
}

export async function addBenefit(formData: FormData) {
  const planId = formData.get('planId') as string;
  const name = formData.get('name') as string;
  const order = parseInt(formData.get('order') as string || '0');

  await prisma.dietPlanBenefit.create({
    data: {
      dietPlanId: planId,
      name,
      order,
    }
  });

  revalidatePath('/admin/diet-plans');
  revalidatePath('/admin/diet-plans/benefits');
  revalidatePath('/diet-plan');
}

export async function removeBenefit(formData: FormData) {
  const id = formData.get('id') as string;

  await prisma.dietPlanBenefit.delete({
    where: { id }
  });

  revalidatePath('/admin/diet-plans');
  revalidatePath('/admin/diet-plans/benefits');
  revalidatePath('/diet-plan');
}

export async function updateBenefit(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;

  await prisma.dietPlanBenefit.update({
    where: { id },
    data: { name }
  });

  revalidatePath('/admin/diet-plans');
  revalidatePath('/admin/diet-plans/benefits');
  revalidatePath('/diet-plan');
}
