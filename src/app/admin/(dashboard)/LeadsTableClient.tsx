'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import LeadStatusDropdown from '@/components/LeadStatusDropdown/LeadStatusDropdown';
import LeadRemarksUpdater from '@/components/LeadRemarksUpdater/LeadRemarksUpdater';
import ServiceabilityCheck from '@/components/ServiceabilityCheck/ServiceabilityCheck';

export default function LeadsTableClient({
  paginatedLeads,
  tab,
  currentPage,
  pageSize
}: {
  paginatedLeads: any[];
  tab: string;
  currentPage: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedLeads.map(lead => lead.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected lead(s)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/leads/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setSelectedIds([]);
        router.refresh();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to delete leads: ${errData.error || res.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (paginatedLeads.length === 0) {
    return <div className={styles.emptyState}>No leads found for this category.</div>;
  }

  return (
    <div>
      {selectedIds.length > 0 && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#2b6cb0' }}>{selectedIds.length} lead(s) selected</span>
          <button 
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            style={{
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              opacity: isDeleting ? 0.7 : 1
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      )}
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th} style={{ width: '40px', textAlign: 'center' }}>
              <input 
                type="checkbox" 
                checked={selectedIds.length === paginatedLeads.length && paginatedLeads.length > 0}
                onChange={handleSelectAll}
                style={{ cursor: 'pointer' }}
              />
            </th>
            <th className={styles.th}>S.NO</th>
            {tab === 'contact' ? (
              <>
                <th className={styles.th}>DATE</th>
                <th className={styles.th}>NAME</th>
                <th className={styles.th}>EMAIL</th>
                <th className={styles.th}>PHONE</th>
                <th className={styles.th}>MESSAGE</th>
              </>
            ) : (
              <>
                {tab !== 'availability' && tab !== 'checkups' && tab !== 'callback' && tab !== 'diet-plan' && <th className={styles.th}>ID</th>}
                <th className={styles.th}>DATE</th>
                {tab === 'checkups' ? (
                  <>
                    <th className={styles.th} style={{ minWidth: '150px' }}>PATIENT DETAILS</th>
                    <th className={styles.th}>CONTACT INFO</th>
                    <th className={styles.th} style={{ minWidth: '220px' }}>FULL ADDRESS</th>
                    <th className={styles.th} style={{ minWidth: '180px' }}>PACKAGE DETAILS</th>
                    <th className={styles.th} style={{ minWidth: '140px' }}>SERVICEABILITY</th>
                  </>
                ) : (
                  <>
                    <th className={styles.th} style={{ minWidth: '150px' }}>NAME</th>
                    <th className={styles.th} style={{ minWidth: '220px' }}>CONTACT</th>
                    {tab === 'availability' ? (
                      <>
                        <th className={styles.th}>STATE</th>
                        <th className={styles.th}>DISTRICT</th>
                        <th className={styles.th}>AREA / LOCALITY</th>
                      </>
                    ) : tab !== 'callback' ? (
                      <th className={styles.th} style={{ minWidth: '200px' }}>LOCATION</th>
                    ) : null}
                    <th className={styles.th} style={{ minWidth: '250px' }}>{tab === 'availability' ? 'SERVICE' : 'PACKAGE/SERVICE'}</th>
                  </>
                )}
                {tab !== 'availability' && (
                  <>
                    <th className={styles.th}>STATUS</th>
                    <th className={styles.th}>UPDATE REASON</th>
                  </>
                )}
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedLeads.map((lead, index) => {
            let contactEmail = lead.email || '-';
            let contactMessage = lead.serviceType || '-';
            if (tab === 'contact' && typeof contactMessage === 'string' && contactMessage.startsWith('Email: ')) {
               const parts = contactMessage.split('\n\n');
               if (!lead.email) {
                   contactEmail = parts[0].replace('Email: ', '');
               }
               contactMessage = parts.slice(1).join('\n\n');
            }
            
            return (
            <tr key={lead.id} className={styles.tr}>
              <td className={styles.td} style={{ textAlign: 'center' }}>
                <input 
                  type="checkbox"
                  checked={selectedIds.includes(lead.id)}
                  onChange={(e) => handleSelectOne(lead.id, e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </td>
              <td className={styles.td} style={{ fontWeight: 'bold' }}>
                {(currentPage - 1) * pageSize + index + 1}
              </td>
              
              {tab === 'contact' ? (
                <>
                  <td className={styles.td} suppressHydrationWarning>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className={styles.td}>
                    <strong>{lead.fullName}</strong>
                  </td>
                  <td className={styles.td}>
                    {contactEmail}
                  </td>
                  <td className={styles.td}>
                    {lead.mobile}
                  </td>
                  <td className={styles.td}>
                    <div style={{ fontSize: '14px', color: '#1e293b', whiteSpace: 'pre-wrap', maxWidth: '400px' }}>
                        {contactMessage}
                    </div>
                  </td>
                </>
              ) : (
                <>
                  {tab !== 'availability' && tab !== 'checkups' && tab !== 'callback' && tab !== 'diet-plan' && (
                  <td className={styles.td} style={{ fontWeight: 'bold', color: '#3182ce' }}>
                    {lead.customId}
                  </td>
                  )}
                  <td className={styles.td} suppressHydrationWarning>
                    {new Date(lead.createdAt).toLocaleDateString()}<br/>
                    {tab !== 'availability' && tab !== 'diet-plan' && tab !== 'checkups' && tab !== 'membership' && tab !== 'callback' && (
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 'bold', 
                      color: lead.enquiryType === 'MEMBERSHIP' ? '#805ad5' : lead.enquiryType === 'HOME_HEALTHCARE' ? '#3182ce' : lead.enquiryType === 'AVAILABILITY' ? '#dd6b20' : lead.enquiryType === 'CONTACT_US' ? '#e53e3e' : lead.enquiryType === 'CALLBACK_REQUEST' ? '#d69e2e' : lead.enquiryType === 'DIET_PLAN' ? '#d53f8c' : '#38a169' 
                    }}>
                      {lead.enquiryType === 'MEMBERSHIP' ? 'Membership' : lead.enquiryType === 'HOME_HEALTHCARE' ? 'Home Healthcare' : lead.enquiryType === 'AVAILABILITY' ? 'Area Enquiry' : lead.enquiryType === 'CONTACT_US' ? 'Contact Form' : lead.enquiryType === 'CALLBACK_REQUEST' ? 'Callback Request' : lead.enquiryType === 'DIET_PLAN' ? 'Diet Plan' : 'Health Checkup'}
                    </span>
                    )}
                  </td>
                  {tab === 'checkups' ? (
                    <>
                      <td className={styles.td}>
                        <strong>{lead.fullName}</strong><br />
                        <span style={{ fontSize: '12px', color: '#718096' }}>Age: {lead.age || 'N/A'} | {lead.gender || 'N/A'}</span>
                      </td>
                      <td className={styles.td}>
                        M: {lead.mobile}
                        {lead.whatsapp && (
                          <><br /><span style={{ color: '#718096', whiteSpace: 'nowrap' }}>W: {lead.whatsapp}</span></>
                        )}
                        {lead.email && <><br /><span style={{ fontSize: '12px', color: '#718096', whiteSpace: 'nowrap' }}>E: {lead.email}</span></>}
                      </td>
                      <td className={styles.td}>
                        {lead.area}, {lead.district}<br />
                        <span style={{ fontSize: '12px', color: '#718096' }}>{lead.state} - {lead.pincode}</span>
                      </td>
                      <td className={styles.td}>
                        <strong style={{ color: 'var(--color-primary)' }}>{lead.package}</strong><br />
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>₹{lead.price}</span>
                      </td>
                      <td className={styles.td}>
                        <ServiceabilityCheck initialPincode={lead.pincode} />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={styles.td}>
                        <strong>{lead.fullName}</strong>
                        {lead.enquiryType === 'DIET_PLAN' && (
                          <><br /><span style={{ fontSize: '12px', color: '#718096' }}>Age: {lead.age || 'N/A'} | {lead.gender || 'N/A'}</span></>
                        )}
                      </td>
                      <td className={styles.td}>
                        M: {lead.mobile}
                        {lead.whatsapp && (
                          <><br /><span style={{ color: '#718096', whiteSpace: 'nowrap' }}>W: {lead.whatsapp}</span></>
                        )}
                        {lead.email && tab === 'availability' && (
                          <><br /><span style={{ fontSize: '12px', color: '#718096', whiteSpace: 'nowrap' }}>E: {lead.email}</span></>
                        )}
                      </td>
                      {tab === 'availability' ? (
                        <>
                          <td className={styles.td}>{lead.state}</td>
                          <td className={styles.td}>{lead.district}</td>
                          <td className={styles.td}>{lead.area}</td>
                        </>
                      ) : tab !== 'callback' ? (
                        <td className={styles.td}>
                          {lead.area ? `${lead.area}` : ''}{lead.area && lead.district ? ', ' : ''}{lead.district || ''}
                          {(lead.enquiryType === 'DIET_PLAN' || lead.enquiryType === 'MEMBERSHIP') && (lead.state || lead.pincode) && (
                            <><br /><span style={{ fontSize: '12px', color: '#718096' }}>{lead.state || ''}{(lead.state && lead.pincode) ? ' - ' : ''}{lead.pincode || ''}</span></>
                          )}
                          {!(lead.area || lead.district || lead.state || lead.pincode) && '-'}
                        </td>
                      ) : null}
                      <td className={styles.td}>
                        {lead.enquiryType === 'MEMBERSHIP' ? (
                          <strong style={{ color: 'var(--color-primary)' }}>{lead.membershipType || 'N/A'}</strong>
                        ) : lead.enquiryType === 'HOME_HEALTHCARE' || lead.enquiryType === 'DIET_PLAN' ? (
                          <strong style={{ color: 'var(--color-primary)' }}>{lead.serviceType}</strong>
                        ) : lead.enquiryType === 'AVAILABILITY' ? (
                          <strong style={{ color: 'var(--color-primary)' }}>Service Area Enquiry</strong>
                        ) : lead.enquiryType === 'CONTACT_US' ? (
                          <div style={{ fontSize: '13px', color: '#4a5568', fontStyle: 'italic', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            "{lead.serviceType}"
                          </div>
                        ) : lead.enquiryType === 'CALLBACK_REQUEST' ? (
                          <strong style={{ color: 'var(--color-primary)' }}>Please Call Back</strong>
                        ) : (
                          <>
                            <strong style={{ color: 'var(--color-primary)' }}>{lead.price}</strong><br />
                            <span style={{ fontSize: '12px' }}>{lead.package}</span>
                          </>
                        )}
                      </td>
                    </>
                  )}
                  {tab !== 'availability' && (
                  <>
                    <td className={styles.td}>
                      <LeadStatusDropdown 
                        leadId={lead.id} 
                        currentStatus={lead.status} 
                        tab={tab}
                      />
                    </td>
                    <td className={styles.td}>
                      <LeadRemarksUpdater leadId={lead.id} initialRemarks={lead.remarks || ''} />
                    </td>
                  </>
                  )}
                </>
              )}
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
}
