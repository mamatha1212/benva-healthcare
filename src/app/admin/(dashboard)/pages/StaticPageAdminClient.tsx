'use client';

import React, { useState } from 'react';
import { createStaticPage, updateStaticPage, deleteStaticPage } from './page-actions';

type StaticPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
};

export default function StaticPageAdminClient({ pages }: { pages: StaticPage[] }) {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(pages[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const selectedPage = pages.find(p => p.id === selectedPageId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* Left: Pages List */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Pages</h3>
          <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{pages.length}</span>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {pages.length === 0 && !isCreating ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No pages yet.</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {pages.map(page => (
                <li 
                  key={page.id} 
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: selectedPageId === page.id && !isCreating ? '#eff6ff' : 'white',
                    borderLeft: selectedPageId === page.id && !isCreating ? '3px solid #2563eb' : '3px solid transparent',
                  }}
                  onClick={() => { setSelectedPageId(page.id); setIsCreating(false); }}
                >
                  <div style={{ fontSize: '14px', fontWeight: selectedPageId === page.id && !isCreating ? 600 : 400, color: '#334155' }}>
                    {page.title}
                    {!page.isActive && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>Draft</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>/{page.slug}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
          <button 
            onClick={() => setIsCreating(true)}
            style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            + Create New Page
          </button>
        </div>
      </div>

      {/* Right: Page Editor */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {(selectedPage && !isCreating) || isCreating ? (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1a202c' }}>
                {isCreating ? 'Create New Page' : 'Edit Page'}
              </h2>
              {!isCreating && selectedPage && (
                <form action={deleteStaticPage} onSubmit={(e) => { if(!confirm('Are you sure you want to delete this page?')) e.preventDefault(); }}>
                  <input type="hidden" name="id" value={selectedPage.id} />
                  <button type="submit" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                    Delete Page
                  </button>
                </form>
              )}
            </div>

            <form action={isCreating ? createStaticPage : updateStaticPage.bind(null, selectedPage!.id)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#4a5568' }}>Page Title</label>
                  <input 
                    name="title" 
                    defaultValue={isCreating ? '' : selectedPage?.title} 
                    required 
                    placeholder="e.g. About Us"
                    style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#4a5568' }}>URL Slug</label>
                  <input 
                    name="slug" 
                    defaultValue={isCreating ? '' : selectedPage?.slug} 
                    required 
                    placeholder="e.g. about-us"
                    style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#4a5568' }}>Content (HTML supported)</label>
                <textarea 
                  name="content" 
                  defaultValue={isCreating ? '' : selectedPage?.content} 
                  required 
                  rows={15}
                  placeholder="<h1>Welcome to BENVA Healthcare</h1><p>Your health is our priority.</p>"
                  style={{ width: '100%', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  name="isActive" 
                  id="isActive"
                  defaultChecked={isCreating ? true : selectedPage?.isActive} 
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '15px', fontWeight: 500, color: '#2d3748', cursor: 'pointer' }}>Publish Page (Visible to users)</label>
              </div>

              <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                {isCreating && (
                  <button type="button" onClick={() => setIsCreating(false)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>
                    Cancel
                  </button>
                )}
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>
                  {isCreating ? 'Create Page' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', padding: '40px' }}>
            Select a page on the left or create a new one.
          </div>
        )}
      </div>

    </div>
  );
}
