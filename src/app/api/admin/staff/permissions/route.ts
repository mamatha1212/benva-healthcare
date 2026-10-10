import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { staffId, moduleName, permissions } = data;

    if (!staffId || !moduleName || !permissions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert the permission for this staff member and module
    const updatedPermission = await prisma.staffPermission.upsert({
      where: {
        staffId_moduleName: {
          staffId,
          moduleName
        }
      },
      update: {
        canView: permissions.canView,
        canAdd: permissions.canAdd,
        canEdit: permissions.canEdit,
        canDelete: permissions.canDelete,
        fieldAccess: permissions.fieldAccess
      },
      create: {
        staffId,
        moduleName,
        canView: permissions.canView,
        canAdd: permissions.canAdd,
        canEdit: permissions.canEdit,
        canDelete: permissions.canDelete,
        fieldAccess: permissions.fieldAccess
      }
    });

    return NextResponse.json(updatedPermission);
  } catch (error) {
    console.error('Error updating staff permissions:', error);
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
  }
}
