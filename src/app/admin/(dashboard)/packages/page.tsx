import { prisma } from '@/lib/prisma';
import styles from '../page.module.css';
import React from 'react';
import Link from 'next/link';
import { deletePackage } from './actions';
import PackageForm from './PackageForm';

export const dynamic = 'force-dynamic';

export default async function PackagesDashboard({ searchParams }: { searchParams: Promise<{ editId?: string }> }) {
  const resolvedParams = await searchParams;
  
  const packages = await prisma.healthPackage.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const editPackage = resolvedParams?.editId ? packages.find(p => p.id === resolvedParams.editId) : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Health Checkup Options</h1>
        <p className={styles.subtitle}>Showing {packages.length} total packages.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
        
        {/* Table List */}
        <div className={styles.tableContainer} style={{ margin: 0 }}>
          {packages.length === 0 ? (
            <div className={styles.emptyState}>No health packages found. Add one on the right.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr className={styles.tr}>
                  <th className={styles.th}>IMAGE</th>
                  <th className={styles.th}>DETAILS</th>
                  <th className={styles.th}>PRICE & TAGS</th>
                  <th className={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className={styles.tr}>
                    <td className={styles.td}>
                      {pkg.image && <img src={pkg.image} alt={pkg.title} style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#f8fafc', borderRadius: '8px' }} />}
                    </td>
                    <td className={styles.td}>
                      <strong>{pkg.title}</strong><br/>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{pkg.subtitle}</span>
                    </td>
                    <td className={styles.td}>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{pkg.price}</strong> <span style={{ textDecoration: 'line-through', fontSize: '12px', color: '#94a3b8' }}>₹{pkg.originalPrice}</span><br/>
                      {pkg.isPopular && <span style={{ background: '#f97316', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>POPULAR</span>}
                    </td>
                    <td className={styles.td} style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/admin/packages?editId=${pkg.id}`} style={{ background: '#e0e7ff', color: '#4338ca', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>Edit</Link>
                      <form action={deletePackage}>
                        <input type="hidden" name="id" value={pkg.id} />
                        <button type="submit" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Form (Always on right) */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <PackageForm />
        </div>

      </div>

      {/* Edit Modal Popup */}
      {editPackage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <PackageForm initialData={editPackage} key={editPackage.id} />
          </div>
        </div>
      )}
    </div>
  );
}
