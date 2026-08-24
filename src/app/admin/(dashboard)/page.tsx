import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import React from 'react';

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || 'all';

  // Fetch leads from database ordered by newest first
  let leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Filter based on tab
  if (tab === 'checkups') {
    leads = leads.filter(l => l.enquiryType === 'HEALTH_CHECKUP');
  } else if (tab === 'memberships') {
    leads = leads.filter(l => l.enquiryType === 'MEMBERSHIP');
  } else if (tab === 'homecare') {
    leads = leads.filter(l => l.enquiryType === 'HOME_HEALTHCARE');
  } else if (tab === 'availability') {
    leads = leads.filter(l => l.enquiryType === 'AVAILABILITY');
  } else if (tab === 'contact') {
    leads = leads.filter(l => l.enquiryType === 'CONTACT_US');
  } else if (tab === 'callback') {
    leads = leads.filter(l => l.enquiryType === 'CALLBACK_REQUEST');
  }

  const getTabTitle = () => {
    if (tab === 'checkups') return 'Health Checkup Leads';
    if (tab === 'memberships') return 'Membership Leads';
    if (tab === 'homecare') return 'Home Healthcare Leads';
    if (tab === 'availability') return 'Area Availability Enquiries';
    if (tab === 'contact') return 'Contact Messages';
    if (tab === 'callback') return 'Callback Requests';
    return 'All Leads';
  };

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1 className={styles.title}>{getTabTitle()}</h1>
        <p className={styles.subtitle}>Showing {leads.length} total entries.</p>
      </div>

      <div className={styles.tableContainer}>
        {leads.length === 0 ? (
          <div className={styles.emptyState}>No leads found for this category.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr className={styles.tr}>
                <th className={styles.th}>DATE</th>
                <th className={styles.th}>NAME</th>
                <th className={styles.th}>CONTACT</th>
                <th className={styles.th}>LOCATION</th>
                <th className={styles.th}>PACKAGE/SERVICE</th>
                <th className={styles.th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className={styles.tr}>
                  <td className={styles.td} suppressHydrationWarning>
                    {new Date(lead.createdAt).toLocaleDateString()}<br/>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 'bold', 
                      color: lead.enquiryType === 'MEMBERSHIP' ? '#805ad5' : lead.enquiryType === 'HOME_HEALTHCARE' ? '#3182ce' : lead.enquiryType === 'AVAILABILITY' ? '#dd6b20' : lead.enquiryType === 'CONTACT_US' ? '#e53e3e' : lead.enquiryType === 'CALLBACK_REQUEST' ? '#d69e2e' : '#38a169' 
                    }}>
                      {lead.enquiryType === 'MEMBERSHIP' ? 'Membership' : lead.enquiryType === 'HOME_HEALTHCARE' ? 'Home Healthcare' : lead.enquiryType === 'AVAILABILITY' ? 'Area Enquiry' : lead.enquiryType === 'CONTACT_US' ? 'Contact Form' : lead.enquiryType === 'CALLBACK_REQUEST' ? 'Callback Request' : 'Health Checkup'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <strong>{lead.fullName}</strong><br />
                    {lead.enquiryType === 'HEALTH_CHECKUP' && (
                      <span style={{ fontSize: '12px', color: '#718096' }}>Age: {lead.age} | {lead.gender}</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    M: {lead.mobile}<br />
                    W: {lead.whatsapp}
                  </td>
                  <td className={styles.td}>
                    {lead.area}, {lead.district}
                  </td>
                  <td className={styles.td}>
                    {lead.enquiryType === 'MEMBERSHIP' ? (
                      <>
                        <strong style={{ color: 'var(--color-primary)' }}>{lead.membershipType}</strong>
                      </>
                    ) : lead.enquiryType === 'HOME_HEALTHCARE' ? (
                      <>
                        <strong style={{ color: 'var(--color-primary)' }}>{lead.serviceType}</strong>
                      </>
                    ) : lead.enquiryType === 'AVAILABILITY' ? (
                      <>
                        <strong style={{ color: 'var(--color-primary)' }}>Service Check</strong>
                      </>
                    ) : lead.enquiryType === 'CONTACT_US' ? (
                      <>
                        <div style={{ fontSize: '13px', color: '#4a5568', fontStyle: 'italic', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          "{lead.serviceType}"
                        </div>
                      </>
                    ) : lead.enquiryType === 'CALLBACK_REQUEST' ? (
                      <>
                        <strong style={{ color: 'var(--color-primary)' }}>Please Call Back</strong>
                      </>
                    ) : (
                      <>
                        <strong style={{ color: 'var(--color-primary)' }}>{lead.price}</strong><br />
                        <span style={{ fontSize: '12px' }}>{lead.package}</span>
                      </>
                    )}
                  </td>
                  <td className={styles.td}>
                    <span className={styles.statusBadge}>{lead.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
