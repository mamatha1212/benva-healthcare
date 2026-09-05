'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LeadsPagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    router.push(`?${params.toString()}`);
  };


  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', alignItems: 'center' }}>
      <button 
        onClick={() => handlePage(currentPage - 1)} 
        disabled={currentPage === 1}
        style={{ padding: '8px 16px', background: currentPage === 1 ? '#e2e8f0' : '#3182ce', color: currentPage === 1 ? '#a0aec0' : '#fff', border: 'none', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
      >
        Previous
      </button>
      
      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4a5568' }}>
        Page {currentPage} of {totalPages}
      </span>
      
      <button 
        onClick={() => handlePage(currentPage + 1)} 
        disabled={currentPage === totalPages}
        style={{ padding: '8px 16px', background: currentPage === totalPages ? '#e2e8f0' : '#3182ce', color: currentPage === totalPages ? '#a0aec0' : '#fff', border: 'none', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
      >
        Next
      </button>
    </div>
  );
}
