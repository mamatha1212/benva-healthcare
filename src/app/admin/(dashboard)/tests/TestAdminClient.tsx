'use client';

import React, { useState } from 'react';
import { addTestCategory, updateTestCategory, deleteTestCategory, addTestItem, updateTestItem, deleteTestItem } from './actions';
import styles from '../page.module.css';

type TestItem = {
  id: string;
  name: string;
  categoryId: string;
};

type Category = {
  id: string;
  name: string;
  tests: TestItem[];
};

export default function TestAdminClient({ categories }: { categories: Category[] }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categories[0]?.id || null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
      
      {/* --- Left Panel: Categories --- */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Test Categories</h3>
          <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{categories.length}</span>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {categories.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No categories yet.</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {categories.map(cat => (
                <li 
                  key={cat.id} 
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: selectedCategoryId === cat.id ? '#eff6ff' : 'white',
                    borderLeft: selectedCategoryId === cat.id ? '3px solid #2563eb' : '3px solid transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {editingCategoryId === cat.id ? (
                    <form 
                      action={async (fd) => { await updateTestCategory(cat.id, fd); setEditingCategoryId(null); }}
                      style={{ display: 'flex', gap: '8px', width: '100%' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <input name="name" defaultValue={cat.name} autoFocus style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                      <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>✓</button>
                      <button type="button" onClick={() => setEditingCategoryId(null)} style={{ background: '#cbd5e1', border: 'none', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>×</button>
                    </form>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: selectedCategoryId === cat.id ? 600 : 400, color: '#334155' }}>{cat.name}</span>
                        <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '10px' }}>{cat.tests.length} tests</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={(e) => { e.stopPropagation(); setEditingCategoryId(cat.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>✏️</button>
                        <form action={deleteTestCategory} onClick={e => e.stopPropagation()}>
                          <input type="hidden" name="id" value={cat.id} />
                          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete Category">🗑️</button>
                        </form>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add Category Form */}
        <div style={{ padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <form action={addTestCategory} style={{ display: 'flex', gap: '8px' }}>
            <input name="name" required placeholder="New Category Name..." style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
            <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Add</button>
          </form>
        </div>
      </div>


      {/* --- Right Panel: Tests in Selected Category --- */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {selectedCategory ? (
          <>
            <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Tests in <span style={{ color: '#2563eb' }}>{selectedCategory.name}</span></h3>
              <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{selectedCategory.tests.length}</span>
            </div>

            <div style={{ padding: '16px', maxHeight: '500px', overflowY: 'auto' }}>
              {selectedCategory.tests.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', padding: '40px 0' }}>No tests in this category yet. Add one below.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedCategory.tests.map((test, index) => (
                    <div key={test.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      
                      {editingTestId === test.id ? (
                        <form 
                          action={async (fd) => { await updateTestItem(test.id, fd); setEditingTestId(null); }}
                          style={{ display: 'flex', gap: '8px', width: '100%' }}
                        >
                          <input name="name" defaultValue={test.name} autoFocus style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                          <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '0 12px', cursor: 'pointer', fontSize: '12px' }}>Save</button>
                          <button type="button" onClick={() => setEditingTestId(null)} style={{ background: '#cbd5e1', border: 'none', borderRadius: '4px', padding: '0 12px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '24px', height: '24px', background: '#f1f5f9', color: '#64748b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>{index + 1}</span>
                            <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>{test.name}</span>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setEditingTestId(test.id)} style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                            <form action={deleteTestItem}>
                              <input type="hidden" name="id" value={test.id} />
                              <button type="submit" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                            </form>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Test Form */}
            <div style={{ padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <form action={addTestItem} style={{ display: 'flex', gap: '8px' }}>
                <input type="hidden" name="categoryId" value={selectedCategory.id} />
                <input name="name" required placeholder="Add new test..." style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>+ Add Test</button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b', padding: '40px' }}>
            Select a category on the left to manage its tests.
          </div>
        )}
      </div>

    </div>
  );
}
