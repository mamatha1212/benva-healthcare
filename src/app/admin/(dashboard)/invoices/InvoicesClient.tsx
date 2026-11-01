'use client';

import React, { useState, useEffect } from 'react';
import styles from './Invoices.module.css';
import InvoiceCreateModal from './InvoiceCreateModal';
import InvoiceDetailModal from './InvoiceDetailModal';
import StatementDownloadModal from './StatementDownloadModal';

interface Props {
  initialInvoices: any[];
}

export default function InvoicesClient({ initialInvoices }: Props) {
  const [invoices, setInvoices] = useState<any[]>(initialInvoices || []);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedModule, setSelectedModule] = useState<'ALL' | 'MEDICINES' | 'LAB_TESTS' | 'DOCTOR' | 'DIETITIAN'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH'>('THIS_MONTH');
  const [billTypeFilter, setBillTypeFilter] = useState<'ALL' | 'GST' | 'NON_GST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createModule, setCreateModule] = useState<'MEDICINES' | 'LAB_TESTS' | 'DOCTOR' | 'DIETITIAN'>('MEDICINES');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter computation
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.getTime() - 7 * 86400000).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime();

  const filteredInvoices = invoices.filter(inv => {
    // Module filter
    if (selectedModule !== 'ALL' && inv.module !== selectedModule) {
      return false;
    }

    // Bill type filter
    if (billTypeFilter !== 'ALL' && inv.billType !== billTypeFilter) {
      return false;
    }

    // Date filter
    const invTime = new Date(inv.billDate || inv.createdAt).getTime();
    if (dateFilter === 'TODAY' && invTime < startOfToday) return false;
    if (dateFilter === 'THIS_WEEK' && invTime < startOfWeek) return false;
    if (dateFilter === 'THIS_MONTH' && invTime < startOfMonth) return false;
    if (dateFilter === 'LAST_MONTH' && (invTime < startOfLastMonth || invTime > endOfLastMonth)) return false;

    // Search query: UHID, Mobile, or Name
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchInvNo = inv.invoiceNo?.toLowerCase().includes(q);
      const matchName = inv.patient?.name?.toLowerCase().includes(q);
      const matchPhone = inv.patient?.phone?.toLowerCase().includes(q);
      const matchUhid = inv.patient?.uhid?.toLowerCase().includes(q);
      if (!matchInvNo && !matchName && !matchPhone && !matchUhid) return false;
    }

    return true;
  });

  // Financial Summaries for the selected filter
  const totalBusiness = filteredInvoices.reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);
  const benvaRevenue = filteredInvoices.reduce((acc, i) => acc + (Number(i.benvaRevenue) || 0), 0);
  const totalInvoicesCount = filteredInvoices.length;
  const totalPaid = filteredInvoices.reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0);
  const totalPending = filteredInvoices.reduce((acc, i) => acc + (Number(i.dueAmount) || 0), 0);

  // This Month Business calculation
  const thisMonthBusiness = invoices
    .filter(i => new Date(i.billDate || i.createdAt).getTime() >= startOfMonth)
    .reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);

  // Module-specific metrics for the 4 cards
  const getModuleMetrics = (mod: string) => {
    const list = invoices.filter(i => i.module === mod);
    const count = list.length;
    const business = list.reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);
    const revenue = list.reduce((acc, i) => acc + (Number(i.benvaRevenue) || 0), 0);
    return { count, business, revenue };
  };

  const medicinesMetrics = getModuleMetrics('MEDICINES');
  const labMetrics = getModuleMetrics('LAB_TESTS');
  const doctorMetrics = getModuleMetrics('DOCTOR');
  const dietitianMetrics = getModuleMetrics('DIETITIAN');

  const openCreateModal = (mod?: 'MEDICINES' | 'LAB_TESTS' | 'DOCTOR' | 'DIETITIAN') => {
    setCreateModule(mod || (selectedModule !== 'ALL' ? selectedModule : 'MEDICINES'));
    setIsCreateOpen(true);
  };

  const openViewInvoice = (inv: any) => {
    setSelectedInvoice(inv);
    setIsDetailOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* Top Header & Universal Controls */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h1>
            <span style={{ fontSize: '28px' }}>🧾</span> Benva Healthcare Billing & Invoices
          </h1>
          <p>
            Universal Healthcare Billing • Fast Billing • With & Without GST Invoicing
          </p>
        </div>

        <div className={styles.controlsArea}>
          {/* Date Filter */}
          <select
            className={styles.dateFilterSelect}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="THIS_MONTH">📅 This Month</option>
            <option value="TODAY">⚡ Today</option>
            <option value="THIS_WEEK">📆 This Week</option>
            <option value="LAST_MONTH">⏮️ Last Month</option>
            <option value="ALL">🌐 All Time</option>
          </select>

          {/* Download Statements */}
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setIsDownloadOpen(true)}
          >
            <span>📥</span> Download Statements
          </button>

          {/* Create New Invoice */}
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => openCreateModal()}
          >
            <span>➕</span> Create New Invoice
          </button>
        </div>
      </div>

      {/* 1. Top Section: 6 Financial Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard} style={{ borderLeft: '4px solid #0284c7' }}>
          <div className={styles.summaryLabel}>Total Business</div>
          <div className={styles.summaryValue} style={{ color: '#0284c7' }}>
            ₹{totalBusiness.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className={styles.summaryCard} style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className={styles.summaryLabel}>Benva Revenue</div>
          <div className={styles.summaryValue} style={{ color: '#8b5cf6' }}>
            ₹{benvaRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className={styles.summaryCard} style={{ borderLeft: '4px solid #475569' }}>
          <div className={styles.summaryLabel}>Total Invoices</div>
          <div className={styles.summaryValue}>{totalInvoicesCount}</div>
        </div>

        <div className={styles.summaryCard} style={{ borderLeft: '4px solid #16a34a' }}>
          <div className={styles.summaryLabel}>Total Paid</div>
          <div className={styles.summaryValue} style={{ color: '#16a34a' }}>
            ₹{totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className={styles.summaryCard} style={{ borderLeft: '4px solid #dc2626' }}>
          <div className={styles.summaryLabel}>Total Pending</div>
          <div className={styles.summaryValue} style={{ color: '#dc2626' }}>
            ₹{totalPending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className={styles.summaryCard} style={{ borderLeft: '4px solid #0d9488' }}>
          <div className={styles.summaryLabel}>This Month Business</div>
          <div className={styles.summaryValue} style={{ color: '#0d9488' }}>
            ₹{thisMonthBusiness.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* 2. Main 4 Billing Modules Section */}
      <div className={styles.modulesSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Four Main Billing Modules</div>
          {selectedModule !== 'ALL' && (
            <button
              onClick={() => setSelectedModule('ALL')}
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: '#0284c7',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Show All Modules (Reset)
            </button>
          )}
        </div>

        <div className={styles.modulesGrid}>
          {/* Module 1: Lab Tests & Checkups */}
          <div
            className={`${styles.moduleCard} ${selectedModule === 'LAB_TESTS' ? styles.moduleCardActive : ''}`}
            onClick={() => setSelectedModule(selectedModule === 'LAB_TESTS' ? 'ALL' : 'LAB_TESTS')}
          >
            <div>
              <div className={styles.moduleTop}>
                <span className={styles.moduleIcon}>🧪</span>
                <div>
                  <div className={styles.moduleName}>Lab Tests & Checkups</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Diagnostic & Preventive</div>
                </div>
              </div>

              <div className={styles.moduleMetrics}>
                <div className={styles.moduleMetricItem}>
                  <span>Invoices</span>
                  <span>{labMetrics.count}</span>
                </div>
                <div className={styles.moduleMetricItem}>
                  <span>Business</span>
                  <span>₹{labMetrics.business.toFixed(0)}</span>
                </div>
                <div className={styles.moduleMetricItem} style={{ gridColumn: 'span 2' }}>
                  <span>Benva Revenue</span>
                  <span style={{ color: '#0284c7' }}>₹{labMetrics.revenue.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <button
              className={styles.moduleBtn}
              onClick={(e) => {
                e.stopPropagation();
                openCreateModal('LAB_TESTS');
              }}
            >
              + Bill Lab Test
            </button>
          </div>

          {/* Module 2: Medicines (Vyapar Style) */}
          <div
            className={`${styles.moduleCard} ${selectedModule === 'MEDICINES' ? styles.moduleCardActive : ''}`}
            onClick={() => setSelectedModule(selectedModule === 'MEDICINES' ? 'ALL' : 'MEDICINES')}
          >
            <div>
              <div className={styles.moduleTop}>
                <span className={styles.moduleIcon}>💊</span>
                <div>
                  <div className={styles.moduleName}>Medicines Billing</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Fast Pharmacy Invoicing</div>
                </div>
              </div>

              <div className={styles.moduleMetrics}>
                <div className={styles.moduleMetricItem}>
                  <span>Invoices</span>
                  <span>{medicinesMetrics.count}</span>
                </div>
                <div className={styles.moduleMetricItem}>
                  <span>Business</span>
                  <span>₹{medicinesMetrics.business.toFixed(0)}</span>
                </div>
                <div className={styles.moduleMetricItem} style={{ gridColumn: 'span 2' }}>
                  <span>Benva Revenue</span>
                  <span style={{ color: '#0284c7' }}>₹{medicinesMetrics.revenue.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <button
              className={styles.moduleBtn}
              onClick={(e) => {
                e.stopPropagation();
                openCreateModal('MEDICINES');
              }}
            >
              + Bill Medicines
            </button>
          </div>

          {/* Module 3: Doctor Consultations */}
          <div
            className={`${styles.moduleCard} ${selectedModule === 'DOCTOR' ? styles.moduleCardActive : ''}`}
            onClick={() => setSelectedModule(selectedModule === 'DOCTOR' ? 'ALL' : 'DOCTOR')}
          >
            <div>
              <div className={styles.moduleTop}>
                <span className={styles.moduleIcon}>👨‍⚕️</span>
                <div>
                  <div className={styles.moduleName}>Doctor Consultations</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Video, Audio & In-Person</div>
                </div>
              </div>

              <div className={styles.moduleMetrics}>
                <div className={styles.moduleMetricItem}>
                  <span>Invoices</span>
                  <span>{doctorMetrics.count}</span>
                </div>
                <div className={styles.moduleMetricItem}>
                  <span>Business</span>
                  <span>₹{doctorMetrics.business.toFixed(0)}</span>
                </div>
                <div className={styles.moduleMetricItem} style={{ gridColumn: 'span 2' }}>
                  <span>Benva Revenue</span>
                  <span style={{ color: '#0284c7' }}>₹{doctorMetrics.revenue.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <button
              className={styles.moduleBtn}
              onClick={(e) => {
                e.stopPropagation();
                openCreateModal('DOCTOR');
              }}
            >
              + Bill Doctor Consult
            </button>
          </div>

          {/* Module 4: Dietitian Plans */}
          <div
            className={`${styles.moduleCard} ${selectedModule === 'DIETITIAN' ? styles.moduleCardActive : ''}`}
            onClick={() => setSelectedModule(selectedModule === 'DIETITIAN' ? 'ALL' : 'DIETITIAN')}
          >
            <div>
              <div className={styles.moduleTop}>
                <span className={styles.moduleIcon}>🥗</span>
                <div>
                  <div className={styles.moduleName}>Dietitian Plans</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>1, 3, 6-Month Nutrition</div>
                </div>
              </div>

              <div className={styles.moduleMetrics}>
                <div className={styles.moduleMetricItem}>
                  <span>Invoices</span>
                  <span>{dietitianMetrics.count}</span>
                </div>
                <div className={styles.moduleMetricItem}>
                  <span>Business</span>
                  <span>₹{dietitianMetrics.business.toFixed(0)}</span>
                </div>
                <div className={styles.moduleMetricItem} style={{ gridColumn: 'span 2' }}>
                  <span>Benva Revenue</span>
                  <span style={{ color: '#0284c7' }}>₹{dietitianMetrics.revenue.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <button
              className={styles.moduleBtn}
              onClick={(e) => {
                e.stopPropagation();
                openCreateModal('DIETITIAN');
              }}
            >
              + Bill Diet Plan
            </button>
          </div>
        </div>
      </div>

      {/* 3. Invoices List / Table Section */}
      <div className={styles.tableSection}>
        {/* Toolbar: Search by UHID/Mobile/Name & Filter Pills */}
        <div className={styles.tableToolbar}>
          <div className={styles.searchBox}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by UHID, Mobile Number, or Customer Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className={styles.filterPills}>
            {/* GST / Non-GST Filter */}
            <button
              type="button"
              className={`${styles.filterPill} ${billTypeFilter === 'ALL' ? styles.filterPillActive : ''}`}
              onClick={() => setBillTypeFilter('ALL')}
            >
              All Types
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${billTypeFilter === 'GST' ? styles.filterPillActive : ''}`}
              onClick={() => setBillTypeFilter('GST')}
            >
              🧾 With GST
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${billTypeFilter === 'NON_GST' ? styles.filterPillActive : ''}`}
              onClick={() => setBillTypeFilter('NON_GST')}
            >
              📄 Without GST
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.invoicesTable}>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer / Patient</th>
                <th>Mobile</th>
                <th>Module</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Invoice Amount</th>
                <th style={{ textAlign: 'right' }}>Paid</th>
                <th style={{ textAlign: 'right' }}>Pending</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    {loading ? 'Loading invoices...' : 'No invoices found matching your search and filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const dateObj = new Date(inv.billDate || inv.createdAt);
                  const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;

                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: '700', color: '#0284c7' }}>
                        {inv.invoiceNo}
                      </td>
                      <td style={{ color: '#475569', fontSize: '12px' }}>
                        {formattedDate}
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>
                          {inv.patient?.name || 'Customer'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>
                          UHID: {inv.patient?.uhid || 'N/A'}
                        </div>
                      </td>
                      <td style={{ color: '#475569', fontSize: '12px' }}>
                        {inv.patient?.phone || '—'}
                      </td>
                      <td>
                        <span className={styles.moduleBadge}>
                          {inv.module === 'LAB_TESTS' ? 'Lab Tests' :
                           inv.module === 'MEDICINES' ? 'Medicines' :
                           inv.module === 'DOCTOR' ? 'Doctor Consult' : 'Dietitian'}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.billTypeBadge} ${inv.billType === 'GST' ? styles.billTypeGst : styles.billTypeNonGst}`}>
                          {inv.billType === 'GST' ? 'GST' : 'Non-GST'}
                        </span>
                      </td>
                      <td className={styles.financialCell} style={{ color: '#0f172a' }}>
                        ₹{Number(inv.totalAmount).toFixed(2)}
                      </td>
                      <td className={styles.financialCell} style={{ color: '#16a34a' }}>
                        ₹{Number(inv.paidAmount).toFixed(2)}
                      </td>
                      <td className={styles.financialCell} style={{ color: Number(inv.dueAmount) > 0 ? '#dc2626' : '#64748b' }}>
                        ₹{Number(inv.dueAmount).toFixed(2)}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          inv.paymentStatus === 'PAID' ? styles.statusPaid :
                          inv.paymentStatus === 'PARTIALLY_PAID' ? styles.statusPartial : styles.statusPending
                        }`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          inv.invoiceStatus === 'CANCELLED' ? styles.statusCancelled : styles.statusPaid
                        }`}>
                          {inv.invoiceStatus || 'GENERATED'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => openViewInvoice(inv)}
                          title="View Complete Invoice"
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => openViewInvoice(inv)}
                          title="Print / Save PDF"
                        >
                          🖨️ PDF
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Creation Modal */}
      <InvoiceCreateModal
        initialModule={createModule}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(created) => {
          fetchInvoices();
          openViewInvoice(created);
        }}
      />

      {/* Invoice View & Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdate={() => fetchInvoices()}
      />

      {/* Statement Download Modal */}
      <StatementDownloadModal
        invoices={filteredInvoices}
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />
    </div>
  );
}
