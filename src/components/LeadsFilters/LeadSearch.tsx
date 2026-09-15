'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LeadSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1'); // reset page on filter
    router.push(`?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', gap: '6px', flex: '1 1 auto', maxWidth: '300px', marginLeft: '16px', marginRight: '16px' }}>
      <input 
        type="text" 
        placeholder="Search name or mobile..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && updateParams('search', search)}
        style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '8px', flex: '1 1 auto', minWidth: '0' }}
      />
      <button 
        onClick={() => updateParams('search', search)}
        style={{ padding: '8px 12px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}
      >
        Search
      </button>
    </div>
  );
}
