'use client';
import React, { useState } from 'react';
import { updateLeadCallDetails } from '@/app/admin/(dashboard)/actions';

export default function LeadRemarksUpdater({ leadId, initialRemarks = '' }: { leadId: string, initialRemarks?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [remarks, setRemarks] = useState(initialRemarks);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLeadCallDetails(leadId, false, remarks);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update remarks");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', minWidth: '150px' }}>
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter reason..."
            autoFocus
            style={{
              width: '100%',
              minHeight: '60px',
              padding: '6px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              resize: 'vertical',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              style={{ padding: '4px 8px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: isSaving ? 'wait' : 'pointer' }}
            >
              {isSaving ? 'Saving...' : 'Update'}
            </button>
            <button 
              onClick={() => {
                setRemarks(initialRemarks);
                setIsEditing(false);
              }}
              disabled={isSaving}
              style={{ padding: '4px 8px', background: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: remarks ? '#1e293b' : '#94a3b8', whiteSpace: 'pre-wrap', flex: 1, wordBreak: 'break-word' }}>
            {remarks || 'No remarks added'}
          </span>
          <button 
            onClick={() => setIsEditing(true)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              color: '#3182ce',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title="Edit Reason"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
