import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const packages = await prisma.healthPackage.findMany({
      select: { id: true, title: true, price: true }
    });
    
    const dietPlans = await prisma.dietPlan.findMany({
      select: { id: true, title: true, price: true }
    });

    const services = [
      ...packages.map(p => ({ id: `pkg_${p.id}`, name: p.title, price: p.price, type: 'Package' })),
      ...dietPlans.map(d => ({ id: `diet_${d.id}`, name: d.title, price: d.price, type: 'Diet Plan' }))
    ];

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
