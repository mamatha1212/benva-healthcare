'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LeadsFilters({ availableDistricts = [], availableStates = [], availablePackages = [], availableYears = [] }: { availableDistricts?: string[], availableStates?: string[], availablePackages?: string[], availableYears?: string[] }) {
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
    <>

      
      {searchParams.get('tab') !== 'availability' && searchParams.get('tab') !== 'contact' && (
        <select 
          value={searchParams.get('status') || 'all'}
          onChange={(e) => updateParams('status', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '8px', outline: 'none', cursor: 'pointer', flex: '1 1 120px', minWidth: '0' }}
        >
          <option value="all">All Statuses</option>
          <option value="New Lead">New Lead</option>
          {searchParams.get('tab') === 'callback' ? (
            <>
              <option value="Call Done">Call Done</option>
              <option value="Call not pickup">Call not pickup</option>
              <option value="Not connected">Not connected</option>
              <option value="Reminder">Reminder</option>
            </>
          ) : (
            <>
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Call not pickup">Call not pickup</option>
              <option value="Not connected">Not connected</option>
              <option value="Not confirmed by user">Not confirmed by user</option>
              <option value="Reminder">Reminder</option>
            </>
          )}
        </select>
      )}
      
      {searchParams.get('tab') === 'memberships' && (
        <select 
          value={searchParams.get('membershipType') || 'all'}
          onChange={(e) => updateParams('membershipType', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '8px', outline: 'none', cursor: 'pointer', flex: '1 1 120px', minWidth: '0' }}
        >
          <option value="all">All Memberships</option>
          <option value="Individual Membership">Individual</option>
          <option value="Family Membership">Family</option>
        </select>
      )}

      {availableStates.length > 0 && (
        <select 
          value={searchParams.get('state') || 'all'}
          onChange={(e) => updateParams('state', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '8px', outline: 'none', cursor: 'pointer', flex: '1 1 120px', minWidth: '0' }}
        >
          <option value="all">All States</option>
          {availableStates.sort().map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}

      {availableDistricts.length > 0 && (
        <select 
          value={searchParams.get('district') || 'all'}
          onChange={(e) => updateParams('district', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '8px', outline: 'none', cursor: 'pointer', flex: '1 1 120px', minWidth: '0' }}
        >
          <option value="all">All Districts</option>
          {availableDistricts.sort().map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      )}

      {searchParams.get('tab') === 'checkups' && availablePackages.length > 0 && (
        <select 
          value={searchParams.get('package') || 'all'}
          onChange={(e) => updateParams('package', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '8px', outline: 'none', cursor: 'pointer', flex: '1 1 120px', minWidth: '0' }}
        >
          <option value="all">All Packages</option>
          {availablePackages.sort().map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      )}

      {availableYears.length > 0 && (
      <select 
        value={searchParams.get('year') || 'all'}
        onChange={(e) => updateParams('year', e.target.value)}
        style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '8px', outline: 'none', cursor: 'pointer', flex: '1 1 120px', minWidth: '0' }}
      >
        <option value="all">All Years</option>
        {availableYears.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      )}

      <select 
        value={searchParams.get('month') || 'all'}
        onChange={(e) => updateParams('month', e.target.value)}
        style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '8px', outline: 'none', cursor: 'pointer', flex: '1 1 120px', minWidth: '0' }}
      >
        <option value="all">All Months</option>
        <option value="01">January</option>
        <option value="02">February</option>
        <option value="03">March</option>
        <option value="04">April</option>
        <option value="05">May</option>
        <option value="06">June</option>
        <option value="07">July</option>
        <option value="08">August</option>
        <option value="09">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>

      <input
        type="date"
        value={searchParams.get('date') || ''}
        onChange={(e) => updateParams('date', e.target.value)}
        style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '8px', outline: 'none', cursor: 'pointer', flex: '1 1 140px', minWidth: '0' }}
        title="Filter by Specific Date"
      />
    </>
  );
}
