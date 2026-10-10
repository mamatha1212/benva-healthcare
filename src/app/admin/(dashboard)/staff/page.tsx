import { prisma } from '@/lib/prisma';
import styles from '../page.module.css'; // Reusing standard admin styles
import Link from 'next/link';
import StaffTableClient from './StaffTableClient';

// Make this route dynamic so it fetches fresh data on every load
export const dynamic = 'force-dynamic';

export default async function ManageStaffPage() {
  // Fetch all staff members from the database
  const staffMembers = await prisma.staff.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      permissions: true,
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.title}>Manage Staff</h1>
          <p className={styles.subtitle}>View and manage all your staff accounts and their permissions.</p>
        </div>
        <Link href="/admin/staff/add" style={{
          background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', 
          fontWeight: 600, textDecoration: 'none', fontSize: '14px'
        }}>
          + Add New Staff
        </Link>
      </div>

      <StaffTableClient staffMembers={staffMembers} />
    </div>
  );
}
