'use server';

import { prisma } from '@/lib/prisma';

export async function getPincodesForDistrict(districtName: string) {
  try {
    // We try to find service locations where the division or district matches
    // Note: In ServiceLocation, the district is usually stored in 'division' or 'region'
    const locations = await prisma.serviceLocation.findMany({
      where: {
        OR: [
          { division: { contains: districtName, mode: 'insensitive' } },
          { region: { contains: districtName, mode: 'insensitive' } },
          { area: { contains: districtName, mode: 'insensitive' } }
        ]
      },
      select: {
        pincode: true,
        officeName: true
      },
      distinct: ['pincode']
    });
    
    // Sort them
    const sorted = locations.sort((a, b) => a.pincode.localeCompare(b.pincode));
    
    return sorted.map(loc => ({
      pincode: loc.pincode,
      officeName: loc.officeName
    }));
  } catch (error) {
    console.error('Failed to fetch pincodes:', error);
    return [];
  }
}
