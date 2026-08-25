'use client';

import React, { useState, useEffect, useRef } from 'react';
import { addPackage, updatePackage } from './actions';
import { useRouter } from 'next/navigation';

export default function PackageForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [originalPrice, setOriginalPrice] = useState(initialData?.originalPrice || '');
  const [discount, setDiscount] = useState(initialData?.discount || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [theme, setTheme] = useState(initialData?.theme || 'themePink');
  const [layout, setLayout] = useState(initialData?.layout || 'left');
  const [isPopular, setIsPopular] = useState(initialData?.isPopular || false);
  
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-calculate price when originalPrice or discount changes (only if it wasn't pre-filled by initialData on mount)
  useEffect(() => {
    if (!originalPrice) return;
    
    // Parse discount (e.g. "30% OFF" -> 30, "30" -> 30)
    let discountValue = 0;
    const match = discount.match(/(\d+)/);
    if (match) {
      discountValue = parseInt(match[1], 10);
    }

    const orig = parseInt(originalPrice, 10);
    if (!isNaN(orig) && discountValue > 0) {
      const calculatedPrice = Math.round(orig - (orig * discountValue / 100));
      // Don't override if we just mounted with initialData
      setPrice(calculatedPrice.toString());
    } else if (!isNaN(orig) && !discount) {
      setPrice(orig.toString());
    }
  }, [originalPrice, discount]);

  const inputStyle = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
          {initialData ? 'Edit Package' : 'Add New Package'}
        </h2>
        {initialData && (
          <button 
            onClick={() => router.push('/admin/packages')}
            style={{ fontSize: '12px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Cancel
          </button>
        )}
      </div>

      <form 
        ref={formRef}
        action={async (formData) => {
          if (initialData) {
            await updatePackage(initialData.id, formData);
            router.push('/admin/packages');
          } else {
            await addPackage(formData);
            formRef.current?.reset();
            setTitle('');
            setSubtitle('');
            setOriginalPrice('');
            setDiscount('');
            setPrice('');
            setTheme('themePink');
            setLayout('left');
            setIsPopular(false);
          }
        }} 
        style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}
      >
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Title</label>
          <input name="title" required type="text" style={inputStyle} placeholder="e.g. Basic Health Checkup" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Subtitle / Description</label>
          <input name="subtitle" required type="text" style={inputStyle} placeholder="Essential health screening..." value={subtitle} onChange={e => setSubtitle(e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Original Price (₹)</label>
            <input 
              name="originalPrice" 
              required 
              type="text" 
              style={inputStyle} 
              placeholder="2495"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Discount Tag</label>
            <input 
              name="discount" 
              required 
              type="text" 
              style={inputStyle} 
              placeholder="48% OFF"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Final Price (₹)</label>
            <input 
              name="price" 
              required 
              type="text" 
              style={inputStyle} 
              placeholder="1299"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Theme Color</label>
            <select name="theme" style={{ ...inputStyle, background: 'white' }} value={theme} onChange={e => setTheme(e.target.value)}>
              <option value="themePink">Pink</option>
              <option value="themeRed">Red</option>
              <option value="themeOrange">Orange</option>
              <option value="themeYellow">Yellow</option>
              <option value="themeGreen">Green</option>
              <option value="themeSkyBlue">Sky Blue</option>
              <option value="themeBlue">Blue</option>
              <option value="themeViolet">Violet</option>
              <option value="themePurple">Purple</option>
              <option value="themeLavender">Lavender</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Upload Image {initialData && "(Leave blank to keep existing)"}</label>
          <input name="imageFile" type="file" accept="image/*" required={!initialData} style={{ padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#f8fafc', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Image Layout</label>
            <select name="layout" style={{ ...inputStyle, background: 'white' }} value={layout} onChange={e => setLayout(e.target.value)}>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: '#334155', cursor: 'pointer', marginTop: '24px' }}>
            <input type="checkbox" name="isPopular" style={{ width: '16px', height: '16px' }} checked={isPopular} onChange={e => setIsPopular(e.target.checked)} />
            Mark as "POPULAR"
          </label>
        </div>

        <button type="submit" style={{ marginTop: '10px', background: initialData ? '#2563eb' : 'var(--color-primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
          {initialData ? 'Update Package' : 'Add Package'}
        </button>
      </form>
    </div>
  );
}
