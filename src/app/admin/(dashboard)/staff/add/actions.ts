'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createStaff(data: any, permissions: any) {
  try {
    // Basic validation
    if (!data.name || !data.email || !data.password) {
      return { success: false, error: 'Name, email, and password are required' };
    }

    // Check if email or username exists
    const existing = await prisma.staff.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username }
        ]
      }
    });

    if (existing) {
      return { success: false, error: 'Staff with this email or username already exists' };
    }

    // Generate an Employee ID if not provided
    const employeeId = data.employeeId || `BENVA-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Staff
    const staff = await prisma.staff.create({
      data: {
        employeeId,
        name: data.name,
        mobileNumber: data.mobileNumber,
        email: data.email,
        department: data.department,
        designation: data.designation,
        username: data.username,
        password: data.password, // IMPORTANT: In production, hash this with bcrypt!
        isTemporaryPwd: true,
        status: 'ACTIVE',
        // Create permissions simultaneously
        permissions: {
          create: permissions.map((p: any) => ({
            moduleName: p.moduleName,
            canView: p.canView,
            canAdd: p.canAdd,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
            canExport: p.canExport,
            fieldAccess: p.fieldAccess || {}
          }))
        }
      }
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        staffId: staff.id, // Usually this would be the SUPER ADMIN's ID who created it, but for now we'll log it under the system or new staff
        action: 'STAFF_CREATED',
        module: 'STAFF_MANAGEMENT',
        description: `Created new staff member: ${staff.name} (${staff.designation})`
      }
    });

    revalidatePath('/admin/staff');
    return { success: true, data: staff };

  } catch (error: any) {
    console.error('Error creating staff:', error);
    return { success: false, error: error.message || 'Failed to create staff' };
  }
}
