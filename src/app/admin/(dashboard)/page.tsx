import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import React from 'react';
import Link from 'next/link';
import LeadStatusDropdown from '@/components/LeadStatusDropdown/LeadStatusDropdown';
import LeadsFilters from '@/components/LeadsFilters/LeadsFilters';
import LeadsPagination from '@/components/LeadsPagination/LeadsPagination';
import ImportExportButtons from '@/components/ImportExportButtons/ImportExportButtons';
import LeadRemarksUpdater from '@/components/LeadRemarksUpdater/LeadRemarksUpdater';
import ServiceabilityCheck from '@/components/ServiceabilityCheck/ServiceabilityCheck';

import LeadsChart from './LeadsChart';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string; status?: string; search?: string; membershipType?: string; district?: string; state?: string; package?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || 'all';
  const page = parseInt(params.page || '1');
  const statusFilter = params.status || 'all';
  const membershipFilter = params.membershipType || 'all';
  const stateFilter = params.state || 'all';
  const districtFilter = params.district || 'all';
  const searchFilter = params.search || '';
  const packageFilter = params.package || 'all';
  const yearFilter = params.year || 'all';
  const monthFilter = params.month || 'all';
  const pageSize = 10;

  let baseWhereClause: any = {};
  
  if (tab === 'checkups') baseWhereClause.enquiryType = 'HEALTH_CHECKUP';
  else if (tab === 'memberships') baseWhereClause.enquiryType = 'MEMBERSHIP';
  else if (tab === 'homecare') baseWhereClause.enquiryType = 'HOME_HEALTHCARE';
  else if (tab === 'availability') baseWhereClause.enquiryType = 'AVAILABILITY';
  else if (tab === 'contact') baseWhereClause.enquiryType = 'CONTACT_US';
  else if (tab === 'callback') baseWhereClause.enquiryType = 'CALLBACK_REQUEST';
  else if (tab === 'diet-plan') baseWhereClause.enquiryType = 'DIET_PLAN';

  const allLeads = await prisma.lead.findMany({
    where: baseWhereClause,
    orderBy: { createdAt: 'asc' }
  });

  const now = new Date();
  now.setHours(0,0,0,0);
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  
  const upcomingReminders = await prisma.reportFile.findMany({
    where: {
      needsReminder: true,
      reminderDate: {
        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Up to 30 days overdue
        lte: thirtyDaysFromNow // Up to 30 days in future
      }
    },
    orderBy: { reminderDate: 'asc' }
  });

  // Bypass Prisma Client cache lock to fetch the newly added 'remarks' column
  let rawRemarks: any[] = [];
  try {
    rawRemarks = await prisma.$queryRawUnsafe(`SELECT id, remarks FROM "Lead" WHERE remarks IS NOT NULL`);
  } catch (e) {
    console.error("Failed to fetch raw remarks:", e);
  }
  const remarksMap = new Map(rawRemarks.map(r => [r.id, r.remarks]));

  let counters: Record<string, number> = { FM: 1, IM: 1, LD: 1, HC: 1, HH: 1, AV: 1, CU: 1, CB: 1, DP: 1 };

  const leadsWithId = allLeads.map(lead => {
    let prefix = 'LD';
    if (lead.enquiryType === 'MEMBERSHIP') {
      if (lead.membershipType === 'Family Membership') prefix = 'FM';
      else if (lead.membershipType === 'Individual Membership') prefix = 'IM';
      else prefix = 'MB';
    }
    else if (lead.enquiryType === 'HEALTH_CHECKUP') prefix = 'HC';
    else if (lead.enquiryType === 'HOME_HEALTHCARE') prefix = 'HH';
    else if (lead.enquiryType === 'AVAILABILITY') prefix = 'AV';
    else if (lead.enquiryType === 'CONTACT_US') prefix = 'CU';
    else if (lead.enquiryType === 'CALLBACK_REQUEST') prefix = 'CB';
    else if (lead.enquiryType === 'DIET_PLAN') prefix = 'DP';
    
    if (counters[prefix] === undefined) counters[prefix] = 1;
    const currentCount = counters[prefix]++;
    
    // Attach the raw remarks to the lead object
    const leadRemarks = remarksMap.get(lead.id) || null;
    
    return { ...lead, customId: `${prefix}${String(currentCount).padStart(5, '0')}`, remarks: leadRemarks };
  });

  let filteredLeads = leadsWithId;

  if (statusFilter !== 'all') {
    filteredLeads = filteredLeads.filter(l => l.status === statusFilter);
  }

  if (tab === 'memberships' && membershipFilter !== 'all') {
    filteredLeads = filteredLeads.filter(l => l.membershipType === membershipFilter);
  }

  if (tab === 'availability' && stateFilter !== 'all') {
    filteredLeads = filteredLeads.filter(l => l.state === stateFilter);
  }

  if (tab === 'availability' && districtFilter !== 'all') {
    filteredLeads = filteredLeads.filter(l => l.district === districtFilter);
  }

  if (searchFilter) {
    const searchLower = searchFilter.toLowerCase();
    filteredLeads = filteredLeads.filter(l => 
      (l.fullName?.toLowerCase().includes(searchLower)) ||
      (l.mobile?.toLowerCase().includes(searchLower)) ||
      (l.customId.toLowerCase().includes(searchLower))
    );
  }

  if (tab === 'checkups' && packageFilter !== 'all') {
    filteredLeads = filteredLeads.filter(l => l.package === packageFilter);
  }

  if (yearFilter !== 'all') {
    filteredLeads = filteredLeads.filter(l => new Date(l.createdAt).getFullYear().toString() === yearFilter);
  }

  if (monthFilter !== 'all') {
    filteredLeads = filteredLeads.filter(l => String(new Date(l.createdAt).getMonth() + 1).padStart(2, '0') === monthFilter);
  }

  filteredLeads.reverse(); // Always newest first

  const totalLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalLeads / pageSize) || 1;
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statusCounts = await prisma.lead.groupBy({
    by: ['status'],
    where: baseWhereClause,
    _count: { status: true }
  });

  const allPackages = await prisma.healthPackage.findMany({
    select: { title: true }
  });

  const countsMap = statusCounts.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {} as Record<string, number>);

  const typeCounts = await prisma.lead.groupBy({
    by: ['enquiryType'],
    _count: { enquiryType: true }
  });

  const typeCountsMap = typeCounts.reduce((acc, curr) => {
    acc[curr.enquiryType] = curr._count.enquiryType;
    return acc;
  }, {} as Record<string, number>);

  const getTabTitle = () => {
    if (tab === 'checkups') return 'Health Checkup Leads';
    if (tab === 'memberships') return 'Membership Leads';
    if (tab === 'homecare') return 'Home Healthcare Leads';
    if (tab === 'availability') return 'Area Availability Enquiries';
    if (tab === 'contact') return 'Contact Messages';
    if (tab === 'callback') return 'Callback Requests';
    if (tab === 'diet-plan') return 'Diet Plan Leads';
    return 'All Leads';
  };

  return (
    <div className={styles.container}>
      
      {/* UPCOMING REMINDERS */}
      {upcomingReminders.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '12px', padding: '16px 24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#d97706', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔔 Upcoming Patient Follow-ups
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {upcomingReminders.map(report => {
              const rDate = report.reminderDate ? new Date(report.reminderDate) : new Date();
              const isOverdue = rDate < now;
              return (
                <div key={report.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${isOverdue ? '#ef4444' : '#10b981'}` }}>
                  <div style={{ fontWeight: 600, color: isOverdue ? '#ef4444' : '#1e293b' }}>
                    Patient Follow-up Due on {rDate.toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    <strong>Name:</strong> {report.patientName || 'Unknown'} <br/>
                    <strong>Mobile:</strong> {report.mobileNumber || 'Not provided'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overview Metrics Row for All Leads */}
      {tab === 'all' && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div className={styles.metricsGrid} style={{ marginBottom: '28px' }}>
          {[
            { label: "All Leads", key: "ALL", color: "#1a202c", bgColor: "#f7fafc", link: "?tab=all" },
            { label: "Health Checkups", key: "HEALTH_CHECKUP", color: "#38a169", bgColor: "#f0fff4", link: "?tab=checkups" },
            { label: "Memberships", key: "MEMBERSHIP", color: "#805ad5", bgColor: "#faf5ff", link: "?tab=memberships" },
            // { label: "Home Healthcare", key: "HOME_HEALTHCARE", color: "#3182ce", bgColor: "#ebf8ff", link: "?tab=homecare" },
            { label: "Diet Plans", key: "DIET_PLAN", color: "#d53f8c", bgColor: "#fff5f7", link: "?tab=diet-plan" },
            { label: "Area Enquiries", key: "AVAILABILITY", color: "#dd6b20", bgColor: "#fffff0", link: "?tab=availability" },
            { label: "Contact Form", key: "CONTACT_US", color: "#e53e3e", bgColor: "#fff5f5", link: "?tab=contact" },
            { label: "Callbacks", key: "CALLBACK_REQUEST", color: "#d69e2e", bgColor: "#fffff0", link: "?tab=callback" }
          ].map(item => {
            const count = item.key === "ALL" ? allLeads.length : (typeCountsMap[item.key] || 0);
            return (
              <Link key={item.key} href={item.link} className={styles.metricsCard} style={{ 
                background: item.bgColor, 
                borderColor: `${item.color}40`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}>
                <span style={{ color: item.color, fontSize: '28px', fontWeight: '900', lineHeight: '1' }}>{count}</span>
                <span style={{ color: '#4a5568', fontSize: '11px', fontWeight: '800', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        <LeadsChart leads={allLeads} />
      </div>
      )}

      {/* Status Metrics Row for Specific Tabs */}
      {tab !== 'all' && tab !== 'availability' && tab !== 'checkups' && tab !== 'contact' && tab !== 'callback' && tab !== 'diet-plan' && (
      <div className={styles.metricsGrid} style={{ marginBottom: '28px' }}>
        {["All", "New Lead", "Interested", "Not Interested", "Call not pickup", "Not connected", "Not confirmed by user"].map(status => {
          let color = "#3182ce";
          let bgColor = "#ebf8ff";
          if (status === "All") { color = "#475569"; bgColor = "#f8fafc"; }
          else if (status === "Interested") { color = "#38a169"; bgColor = "#f0fff4"; }
          else if (status === "Not Interested") { color = "#e53e3e"; bgColor = "#fff5f5"; }
          else if (status === "Call not pickup") { color = "#dd6b20"; bgColor = "#fffff0"; }
          else if (status === "Not connected") { color = "#718096"; bgColor = "#edf2f7"; }
          else if (status === "Not confirmed by user") { color = "#805ad5"; bgColor = "#faf5ff"; }
          
          const newParams = new URLSearchParams();
          if (tab !== 'all') newParams.set('tab', tab);
          
          // Toggle off if clicking the active one, or if clicking "All"
          const nextStatus = (statusFilter === status || status === "All") ? 'all' : status;
          if (nextStatus !== 'all') newParams.set('status', nextStatus);
          
          if (membershipFilter !== 'all') newParams.set('membershipType', membershipFilter);
          if (searchFilter) newParams.set('search', searchFilter);
          newParams.set('page', '1');

          const isActive = status === "All" ? statusFilter === 'all' : statusFilter === status;
          const count = status === "All" ? allLeads.length : (countsMap[status] || 0);

          return (
            <Link key={status} href={`?${newParams.toString()}`} className={styles.metricsCard} style={{ 
              background: isActive ? bgColor : '#ffffff', 
              border: `2px solid ${isActive ? color : '#e2e8f0'}`,
              boxShadow: isActive ? `0 4px 12px ${color}15` : '0 2px 4px rgba(0,0,0,0.02)',
              opacity: isActive ? 1 : 0.85,
              transform: isActive ? 'scale(1.02)' : 'none',
              transition: 'all 0.2s ease'
            }}>
              <span style={{ color: color, fontSize: '28px', fontWeight: '900', lineHeight: '1' }}>{count}</span>
              <span style={{ color: '#4a5568', fontSize: '12px', fontWeight: '800', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{status}</span>
            </Link>
          );
        })}
      </div>
      )}

      {tab === 'all' ? null : tab === 'availability' && stateFilter === 'all' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className={styles.title} style={{ marginBottom: '4px' }}>Select State</h1>
              <p className={styles.subtitle} style={{ margin: 0 }}>Choose a state to view area availability enquiries.</p>
            </div>
            <ImportExportButtons />
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <Link href="?tab=availability&state=Andhra Pradesh" style={{ flex: 1, minWidth: '300px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textDecoration: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'all 0.2s ease' }}>
              <div style={{ width: '64px', height: '64px', background: '#ebf8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3182ce' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Andhra Pradesh</h2>
              <p style={{ color: '#64748b', margin: 0, textAlign: 'center' }}>View all enquiries from AP</p>
            </Link>
            <Link href="?tab=availability&state=Telangana" style={{ flex: 1, minWidth: '300px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textDecoration: 'none', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'all 0.2s ease' }}>
              <div style={{ width: '64px', height: '64px', background: '#f0fff4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38a169' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Telangana</h2>
              <p style={{ color: '#64748b', margin: 0, textAlign: 'center' }}>View all enquiries from TS</p>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            
            {/* Top Row: Title and Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '8px' }}>
              <div className={styles.header} style={{ marginBottom: 0, flexShrink: 1, minWidth: 0, overflow: 'hidden' }}>
                <h1 className={styles.title} style={{ marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tab === 'availability' ? `${stateFilter} Enquiries` : getTabTitle()}
                </h1>
                <p className={styles.subtitle} style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Showing {paginatedLeads.length} of {totalLeads} total entries.</p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ImportExportButtons />
              </div>
            </div>

            {/* Bottom Row: Filters Section */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <LeadsFilters 
                availableStates={Array.from(new Set(allLeads.map(l => l.state).filter(s => s && s !== 'N/A' && s !== 'Not Listed')))}
                availableDistricts={Array.from(new Set(allLeads.filter(l => stateFilter === 'all' || l.state === stateFilter).map(l => l.district).filter(d => d && d !== 'N/A' && d !== 'Not Listed')))} 
                availablePackages={Array.from(new Set([
                  ...allPackages.map(p => p.title),
                  ...allLeads.filter(l => l.enquiryType === 'HEALTH_CHECKUP' && l.package).map(l => l.package as string)
                ]))}
                availableYears={Array.from(new Set(allLeads.map(l => new Date(l.createdAt).getFullYear().toString()))).sort().reverse()}
              />
            </div>

          </div>

          <div className={styles.tableContainer}>
            {paginatedLeads.length === 0 ? (
              <div className={styles.emptyState}>No leads found for this category.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tr}>
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
                                  {lead.area}, {lead.district}
                                  {lead.enquiryType === 'DIET_PLAN' && (
                                    <><br /><span style={{ fontSize: '12px', color: '#718096' }}>{lead.state} - {lead.pincode}</span></>
                                  )}
                                </td>
                              ) : null}
                              <td className={styles.td}>
                                {lead.enquiryType === 'MEMBERSHIP' ? (
                                  <strong style={{ color: 'var(--color-primary)' }}>{lead.membershipType}</strong>
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
            )}
          </div>
          
          <LeadsPagination currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
