'use client';

import React from 'react';

export default function DeleteForm({ id, action, itemName = 'item' }: { id: string, action: (formData: FormData) => void, itemName?: string }) {
  return (
    <form action={action} onSubmit={(e) => { if(!confirm(`Are you sure you want to delete this ${itemName}?`)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Delete</button>
    </form>
  );
}
