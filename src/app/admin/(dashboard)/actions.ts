'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateLeadStatus(leadId: string, status: string) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status }
    });
    
    // Revalidate the dashboard so the server component shows the latest status on refresh
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update lead status:", error);
    throw new Error("Failed to update status");
  }
}

export async function updateLeadCallDetails(leadId: string, isCallDone: boolean, remarks: string) {
  try {
    // Using raw SQL to bypass Prisma Client cache lock issue on Windows
    await prisma.$executeRawUnsafe(`UPDATE "Lead" SET remarks = $1 WHERE id = $2`, remarks, leadId);
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Failed to update call details:", error);
    throw new Error("Failed to update call details");
  }
}

export async function getLeadsForExport(filters: any) {
  try {
    let baseWhereClause: any = {};
    if (filters.tab === 'checkups') baseWhereClause.enquiryType = 'HEALTH_CHECKUP';
    else if (filters.tab === 'memberships') baseWhereClause.enquiryType = 'MEMBERSHIP';
    else if (filters.tab === 'homecare') baseWhereClause.enquiryType = 'HOME_HEALTHCARE';
    else if (filters.tab === 'availability') baseWhereClause.enquiryType = 'AVAILABILITY';
    else if (filters.tab === 'contact') baseWhereClause.enquiryType = 'CONTACT_US';
    else if (filters.tab === 'callback') baseWhereClause.enquiryType = 'CALLBACK_REQUEST';

    let whereClause = { ...baseWhereClause };

    if (filters.status && filters.status !== 'all') {
      whereClause.status = filters.status;
    }

    if (filters.tab === 'memberships' && filters.membershipType && filters.membershipType !== 'all') {
      whereClause.membershipType = filters.membershipType;
    }

    if (filters.search) {
      whereClause.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { mobile: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    });
    
    // Track independent counters for each prefix type
    let counters: Record<string, number> = {
      FM: 1,
      IM: 1,
      LD: 1
    };
    
    // Map leads to format ID and remove unwanted columns
    const formattedLeads = leads.map((lead) => {
      let prefix = 'LD';
      if (lead.membershipType === 'Family Membership') prefix = 'FM';
      else if (lead.membershipType === 'Individual Membership') prefix = 'IM';
      
      const currentCount = counters[prefix]++;
      const paddedId = String(currentCount).padStart(5, '0');
      
      return {
        id: `${prefix}${paddedId}`,
        enquiryType: lead.enquiryType,
        fullName: lead.fullName,
        mobile: lead.mobile,
        whatsapp: lead.whatsapp,
        email: lead.email,
        state: lead.state,
        district: lead.district,
        area: lead.area,
        pincode: lead.pincode,
        membershipType: lead.membershipType,
        status: lead.status,
        createdAt: lead.createdAt
      };
    });

    return formattedLeads;
  } catch (error) {
    console.error("Failed to fetch leads for export:", error);
    throw new Error("Failed to fetch leads");
  }
}

export async function importLeads(leadsData: any[]) {
  try {
    const recordsToCreate = leadsData.map(row => {
      return {
        fullName: row.fullName || row.name || row.NAME || 'Unknown',
        mobile: String(row.mobile || row.contact || row.CONTACT || ''),
        whatsapp: String(row.whatsapp || row.mobile || ''),
        email: row.email || row.EMAIL || null,
        enquiryType: row.enquiryType || row.enquiryTyp || 'MEMBERSHIP',
        status: row.status || row.STATUS || 'New Lead',
        state: row.state || row.STATE || '',
        district: row.district || row.DISTRICT || '',
        area: row.area || row.AREA || '',
        pincode: String(row.pincode || row.PINCODE || ''),
        membershipType: row.membershipType || row.package || row.service || null,
        gender: row.gender || row.GENDER || null,
        age: row.age ? String(row.age) : null,
        createdAt: row.createdAt ? new Date(row.createdAt) : new Date()
      };
    });

    await prisma.lead.createMany({
      data: recordsToCreate
    });

    revalidatePath('/admin');
    return { success: true, count: recordsToCreate.length };
  } catch (error) {
    console.error("Failed to import leads:", error);
    throw new Error("Failed to import leads");
  }
}
