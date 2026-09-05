'use client';
import React, { useState } from 'react';
import { updateLeadStatus, updateLeadCallDetails } from '@/app/admin/(dashboard)/actions';

const CALLBACK_STATUS_OPTIONS = [
  "New Lead",
  "Call Done",
  "Call not pickup",
  "Not connected"
];

const NORMAL_STATUS_OPTIONS = [
  "New Lead",
  "Interested",
  "Not Interested",
  "Call not pickup",
  "Not connected",
  "Not confirmed by user"
];

export default function LeadStatusDropdown({ leadId, currentStatus, tab }: { leadId: string, currentStatus: string, tab?: string }) {
  const [status, setStatus] = useState(currentStatus);
  const options = tab === 'callback' ? CALLBACK_STATUS_OPTIONS : NORMAL_STATUS_OPTIONS;
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setIsLoading(true);
    
    try {
      await updateLeadStatus(leadId, newStatus);
    } catch (err) {
      alert("Failed to update status");
      setStatus(currentStatus); // Revert on failure
    } finally {
      setIsLoading(false);
    }
  };


  const getStatusColor = (s: string) => {
    switch (s) {
      case "New Lead": return "#3182ce"; // Blue
      case "Call Done": return "#38a169"; // Green
      case "Interested": return "#38a169"; // Green
      case "Not Interested": return "#e53e3e"; // Red
      case "Call not pickup": return "#dd6b20"; // Orange
      case "Not connected": return "#718096"; // Gray
      case "Not confirmed by user": return "#805ad5"; // Purple
      default: return "#4a5568";
    }
  };

  return (
    <select 
      value={status}
      onChange={handleChange}
      disabled={isLoading}
      style={{
        padding: '6px 10px',
        borderRadius: '6px',
        border: `1px solid ${getStatusColor(status)}`,
        backgroundColor: '#fff',
        color: getStatusColor(status),
        fontSize: '13px',
        cursor: isLoading ? 'wait' : 'pointer',
        fontWeight: 'bold',
        outline: 'none',
        transition: 'all 0.2s',
        minWidth: '160px'
      }}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
      {/* Fallback if current status isn't in standard options */}
      {!options.includes(status) && (
        <option value={status}>{status}</option>
      )}
    </select>
  );
}
