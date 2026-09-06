import { prisma } from '@/lib/prisma';
import styles from '../page.module.css';
import React from 'react';
import Link from 'next/link';
import DietPlanForm from './DietPlanForm';
import LeadsPagination from '@/components/LeadsPagination/LeadsPagination';
import { deleteDietPlan } from './actions';

export const dynamic = 'force-dynamic';

export default async function DietPlansDashboard({ searchParams }: { searchParams: Promise<{ editId?: string, page?: string }> }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams?.page || '1');
  const pageSize = 10;
  
  const allPlans = await prisma.dietPlan.findMany({
    orderBy: { createdAt: 'desc' },
    include: { benefits: { orderBy: { order: 'asc' } } }
  });

  const totalPlans = allPlans.length;
  const totalPages = Math.ceil(totalPlans / pageSize) || 1;
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const paginatedPlans = allPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const editPlan = resolvedParams?.editId ? allPlans.find(p => p.id === resolvedParams.editId) : null;

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.title}>Manage Diet Plans</h1>
          <p className={styles.subtitle}>Showing {paginatedPlans.length} of {totalPlans} total plans.</p>
        </div>
        <Link 
          href="/admin/diet-plans/benefits"
          style={{ background: '#059669', color: 'white', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          Manage Diet Plan Details
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
        
        {/* Table List */}
        <div className={styles.tableContainer} style={{ margin: 0 }}>
          {allPlans.length === 0 ? (
            <div className={styles.emptyState}>No diet plans found. Add one on the right.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr className={styles.tr}>
                  <th className={styles.th}>PLAN DETAILS</th>
                  <th className={styles.th}>PRICE & DURATION</th>
                  <th className={styles.th}>BENEFITS</th>
                  <th className={styles.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPlans.map((plan) => (
                  <tr key={plan.id} className={styles.tr}>
                    <td className={styles.td}>
                      <strong>{plan.title}</strong><br/>
                      {!plan.isActive && <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>INACTIVE</span>}
                    </td>
                    <td className={styles.td}>
                      <strong style={{ color: 'var(--color-primary)' }}>₹{plan.price}</strong> <span style={{ fontSize: '12px', color: '#94a3b8' }}>{plan.priceUnit}</span><br/>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{plan.duration}</span>
                    </td>
                    <td className={styles.td}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{plan.benefits.length} items</span>
                    </td>
                    <td className={styles.td} style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/admin/diet-plans?editId=${plan.id}`} style={{ background: '#e0e7ff', color: '#4338ca', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', textDecoration: 'none' }}>Edit</Link>
                      <form action={deleteDietPlan}>
                        <input type="hidden" name="id" value={plan.id} />
                        <button type="submit" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          <LeadsPagination currentPage={currentPage} totalPages={totalPages} />
        </div>

        {/* Add Form (Always on right) */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <DietPlanForm />
        </div>

      </div>

      {/* Edit Modal Popup */}
      {editPlan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <DietPlanForm initialData={editPlan} key={editPlan.id} />
          </div>
        </div>
      )}
    </div>
  );
}
