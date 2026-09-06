'use client';

import React, { useState } from 'react';
import { addBenefit, removeBenefit, updateBenefit } from '../actions';
import { useRouter } from 'next/navigation';

export default function BenefitsClient({ allPlans }: { allPlans: any[] }) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [newBenefit, setNewBenefit] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [editingBenefitId, setEditingBenefitId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const selectedPlan = allPlans.find(p => p.id === selectedPlanId);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBenefit.trim() || !selectedPlanId) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('planId', selectedPlanId);
    formData.append('name', newBenefit);
    formData.append('order', (selectedPlan?.benefits?.length || 0).toString());
    
    await addBenefit(formData);
    setNewBenefit('');
    setLoading(false);
  };

  const handleRemove = async (benefitId: string) => {
    const formData = new FormData();
    formData.append('id', benefitId);
    await removeBenefit(formData);
  };

  const handleSaveEdit = async (benefitId: string) => {
    if (!editName.trim()) return;
    const formData = new FormData();
    formData.append('id', benefitId);
    formData.append('name', editName);
    await updateBenefit(formData);
    setEditingBenefitId(null);
  };

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', maxWidth: '600px' }}>
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Select a Diet Plan</label>
        <select 
          value={selectedPlanId}
          onChange={(e) => setSelectedPlanId(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '15px' }}
        >
          <option value="">-- Select a Plan --</option>
          {allPlans.map(plan => (
            <option key={plan.id} value={plan.id}>{plan.title} (₹{plan.price})</option>
          ))}
        </select>
      </div>

      {selectedPlan && (
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#1e293b' }}>Benefits for "{selectedPlan.title}"</h3>
          
          <div style={{ marginBottom: '24px' }}>
            {selectedPlan.benefits.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>No benefits added to this plan yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedPlan.benefits.map((b: any) => (
                  <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    
                    {editingBenefitId === b.id ? (
                      <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '12px' }}>
                        <input 
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          style={{ flex: 1, padding: '6px 12px', border: '1px solid #3b82f6', borderRadius: '6px', fontSize: '14px' }}
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleSaveEdit(b.id)}
                        />
                      </div>
                    ) : (
                      <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>{b.name}</span>
                    )}
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingBenefitId === b.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(b.id)} style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Save</button>
                          <button onClick={() => setEditingBenefitId(null)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingBenefitId(b.id); setEditName(b.name); }} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Edit</button>
                          <button onClick={() => handleRemove(b.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Remove</button>
                        </>
                      )}
                    </div>

                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px' }}>
            <input 
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              placeholder="Type a new benefit... (e.g. 1 Monthly Consultation)" 
              required
              style={{ flex: 1, padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Adding...' : 'Add Benefit'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
