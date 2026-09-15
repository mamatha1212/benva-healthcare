'use client';

import React, { useState } from 'react';
import AdminAddLeadModal from '../AdminAddLeadModal/AdminAddLeadModal';

interface AdminAddLeadButtonProps {
  availablePackages: { title: string; price?: string }[];
}

export default function AdminAddLeadButton({ availablePackages }: AdminAddLeadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          background: '#3182ce',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add New Lead
      </button>

      {isOpen && (
        <AdminAddLeadModal 
          availablePackages={availablePackages}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
