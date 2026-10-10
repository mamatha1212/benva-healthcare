import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Create a test Staff Member
    const staff = await prisma.staff.upsert({
      where: { email: 'test.receptionist@benva.in' },
      update: {},
      create: {
        employeeId: 'BENVA-001',
        name: 'Jane Doe',
        mobileNumber: '9876543210',
        email: 'test.receptionist@benva.in',
        department: 'Front Desk',
        designation: 'Receptionist',
        username: 'janedoe',
        password: 'hashed_password_here', // We will hash this properly later
      },
    });

    // 2. Assign Permissions to this Staff Member for the "PATIENTS" module
    const permission = await prisma.staffPermission.upsert({
      where: {
        staffId_moduleName: {
          staffId: staff.id,
          moduleName: 'PATIENTS'
        }
      },
      update: {},
      create: {
        staffId: staff.id,
        moduleName: 'PATIENTS',
        // Action-level
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: false, // Cannot delete!
        canExport: false, // Cannot export!
        
        // Field-level (This is the JSON superpower)
        fieldAccess: {
          patientName: true,
          mobileNumber: true,
          address: true,
          medicalHistory: false, // NO ACCESS!
          prescription: false,   // NO ACCESS!
          labReports: false      // NO ACCESS!
        }
      }
    });

    // 3. Create a test Audit Log entry
    await prisma.auditLog.create({
      data: {
        staffId: staff.id,
        action: 'TEST_SCRIPT_RAN',
        module: 'SYSTEM',
        description: 'Ran the RBAC test script to verify database relationships.',
      }
    });

    // 4. Fetch everything back from the database to prove it works
    const testResult = await prisma.staff.findUnique({
      where: { id: staff.id },
      include: {
        permissions: true,
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    return NextResponse.json({
      message: "Success! The RBAC database schema is working perfectly.",
      data: testResult
    });

  } catch (error: any) {
    console.error("Test Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
