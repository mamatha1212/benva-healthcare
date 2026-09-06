'use client';

import React, { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { addDietPlan, updateDietPlan } from './actions';
import { useRouter } from 'next/navigation';

function SubmitButton({ initialData }: { initialData?: any }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: pending ? 0.7 : 1 }}>
      {pending ? (initialData ? 'Updating...' : 'Adding...') : (initialData ? 'Update Diet Plan' : 'Add Diet Plan')}
    </button>
  );
}

export default function DietPlanForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  const inputStyle = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
          {initialData ? 'Edit Diet Plan' : 'Add New Diet Plan'}
        </h2>
        {initialData && (
          <button 
            type="button"
            onClick={() => router.push('/admin/diet-plans')}
            style={{ border: 'none', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
          >
            Cancel
          </button>
        )}
      </div>

      <form 
        ref={formRef}
        action={async (formData) => {
          if (initialData) {
            await updateDietPlan(formData);
          } else {
            await addDietPlan(formData);
            formRef.current?.reset();
          }
        }} 
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {initialData && <input type="hidden" name="id" value={initialData.id} />}
        
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Plan Title</label>
          <input name="title" defaultValue={initialData?.title || ''} required style={inputStyle} placeholder="e.g. Monthly Plan" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Duration Text</label>
          <input name="duration" defaultValue={initialData?.duration || ''} required style={inputStyle} placeholder="e.g. Minimum 6 Months Plan" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Price</label>
            <input name="price" defaultValue={initialData?.price || ''} required style={inputStyle} placeholder="e.g. 999" type="number" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Price Unit</label>
            <input name="priceUnit" defaultValue={initialData?.priceUnit || '/ Mo'} required style={inputStyle} placeholder="e.g. / Mo" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <input type="checkbox" id="isActive" name="isActive" defaultChecked={initialData ? initialData.isActive : true} />
          <label htmlFor="isActive" style={{ fontSize: '14px', color: '#334155' }}>Active (Visible on website)</label>
        </div>

        <SubmitButton initialData={initialData} />
      </form>
    </div>
  );
}
