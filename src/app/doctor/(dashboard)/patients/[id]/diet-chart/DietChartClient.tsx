'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PREDEFINED_DIET_TEMPLATES,
  QUICK_ADD_OPTIONS,
  DietPlanData,
  MealSlot
} from '@/lib/dietTemplates';
import { formatDate } from '@/lib/dateUtils';

const createEmptyDietChart = (): DietPlanData => ({
  title: 'PERSONALIZED DIET PLAN',
  subtitle: 'Personalised Nutrition & Diet Chart',
  consultationMode: 'Online / Clinic',
  calorieTarget: '',
  meals: [
    { id: 'm1', name: 'Early Morning', time: '6:00 – 7:00 AM', items: '', serving: '', note: '' },
    { id: 'm2', name: 'Breakfast', time: '8:00 – 9:00 AM', items: '', serving: '', note: '' },
    { id: 'm3', name: 'Mid-Morning', time: '11:00 AM', items: '', serving: '', note: '' },
    { id: 'm4', name: 'Lunch', time: '1:00 – 2:00 PM', items: '', serving: '', note: '' },
    { id: 'm5', name: 'Evening', time: '4:30 – 5:30 PM', items: '', serving: '', note: '' },
    { id: 'm6', name: 'Dinner', time: '7:30 – 8:30 PM', items: '', serving: '', note: '' },
    { id: 'm7', name: 'Before Bed', time: '9:30 PM', items: '', serving: '', note: '' }
  ],
  foodsToInclude: [],
  foodsInModeration: [],
  foodsToAvoid: [],
  dietaryGuidelines: [],
  followUp: ''
});

interface Props {
  patient: any;
  doctor: any;
  initialChartData?: DietPlanData | null;
  existingFile?: any | null;
  initialViewMode?: boolean;
}

export default function DietChartClient({
  patient,
  doctor,
  initialChartData,
  existingFile,
  initialViewMode = false,
}: Props) {
  const router = useRouter();

  // Clean empty template by default so dietitians choose options without deleting pre-filled text
  const defaultTemplateKey = 'empty';
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(defaultTemplateKey);

  const [chartData, setChartData] = useState<DietPlanData>(
    initialChartData || createEmptyDietChart()
  );

  const [isViewMode, setIsViewMode] = useState<boolean>(initialViewMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Local state inputs for quick-adding new items
  const [newIncludeText, setNewIncludeText] = useState('');
  const [newModerationText, setNewModerationText] = useState('');
  const [newAvoidText, setNewAvoidText] = useState('');
  const [newGuidelineText, setNewGuidelineText] = useState('');

  // Format dietitian title
  const rawDoctorName = doctor?.name || patient?.consultant || 'Dietitian';
  const isDtPrefixed = rawDoctorName.toLowerCase().startsWith('dt.') || rawDoctorName.toLowerCase().startsWith('dt ');
  const dietitianName = isDtPrefixed ? rawDoctorName : `Dt. ${rawDoctorName}`;

  // Handle template selection
  const handleApplyTemplate = (templateKey: string) => {
    if (templateKey === 'empty' || templateKey === 'custom') {
      setChartData(createEmptyDietChart());
      return;
    }

    const template = PREDEFINED_DIET_TEMPLATES[templateKey];
    if (template) {
      setChartData(JSON.parse(JSON.stringify(template)));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all fields to start with empty inputs?')) {
      setChartData(createEmptyDietChart());
    }
  };

  // Meal management - empty by default so user can click quick-add chips directly
  const handleAddMeal = (preset?: { name: string; time?: string }) => {
    const newMeal: MealSlot = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      time: preset?.time || '8:00 – 9:00 AM',
      name: preset?.name || 'Meal',
      items: '',
      serving: '',
      note: ''
    };
    setChartData(prev => ({ ...prev, meals: [...prev.meals, newMeal] }));
  };

  const handleUpdateMeal = (id: string, field: keyof MealSlot, value: string) => {
    setChartData(prev => ({
      ...prev,
      meals: prev.meals.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const handleRemoveMeal = (id: string) => {
    setChartData(prev => ({
      ...prev,
      meals: prev.meals.filter(m => m.id !== id)
    }));
  };

  const getMealFoodSuggestions = (mealName: string): string[] => {
    const lower = (mealName || '').toLowerCase();
    const cat = QUICK_ADD_OPTIONS.mealItemsByCategory as Record<string, string[]>;
    if (!cat) return [];
    if (lower.includes('early') || lower.includes('wakeup') || lower.includes('wake-up') || (lower.includes('morning') && !lower.includes('mid') && !lower.includes('break'))) {
      return cat.earlyMorning || [];
    }
    if (lower.includes('breakfast') || lower.includes('brunch')) {
      return cat.breakfast || [];
    }
    if (lower.includes('mid') || lower.includes('snack') || lower.includes('11')) {
      return cat.midMorning || [];
    }
    if (lower.includes('lunch') || lower.includes('afternoon') || lower.includes('noon')) {
      return cat.lunch || [];
    }
    if (lower.includes('evening') || lower.includes('tea') || lower.includes('4:') || lower.includes('5:')) {
      return cat.evening || [];
    }
    if (lower.includes('dinner') || lower.includes('night') || lower.includes('supper') || lower.includes('7:') || lower.includes('8:')) {
      return cat.dinner || [];
    }
    if (lower.includes('bed') || lower.includes('sleep') || lower.includes('9:')) {
      return cat.beforeBed || [];
    }
    return cat.general || [];
  };

  const handleAppendMealItem = (mealId: string, item: string) => {
    setChartData(prev => ({
      ...prev,
      meals: prev.meals.map(m => {
        if (m.id !== mealId) return m;
        const current = (m.items || '').trim();
        if (!current) return { ...m, items: item };
        if (current.includes(item)) return m;
        const prefix = current.includes('•') ? '\n• ' : '\n';
        return { ...m, items: `${current}${prefix}${item.replace(/^•\s*/, '')}` };
      })
    }));
  };

  const handleSetMealServing = (mealId: string, serving: string) => {
    setChartData(prev => ({
      ...prev,
      meals: prev.meals.map(m => (m.id === mealId ? { ...m, serving } : m))
    }));
  };

  const handleAppendMealNote = (mealId: string, note: string) => {
    setChartData(prev => ({
      ...prev,
      meals: prev.meals.map(m => {
        if (m.id !== mealId) return m;
        const current = (m.note || '').trim();
        if (!current) return { ...m, note };
        if (current.includes(note)) return m;
        return { ...m, note: `${current}. ${note}` };
      })
    }));
  };

  // List management helpers
  const handleAddItem = (
    listKey: 'foodsToInclude' | 'foodsInModeration' | 'foodsToAvoid' | 'dietaryGuidelines',
    text: string,
    clearFn: () => void
  ) => {
    if (!text.trim()) return;
    setChartData(prev => ({
      ...prev,
      [listKey]: [...prev[listKey], text.trim()]
    }));
    clearFn();
  };

  const handleRemoveItem = (
    listKey: 'foodsToInclude' | 'foodsInModeration' | 'foodsToAvoid' | 'dietaryGuidelines',
    index: number
  ) => {
    setChartData(prev => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index)
    }));
  };

  const handleQuickAdd = (
    listKey: 'foodsToInclude' | 'foodsInModeration' | 'foodsToAvoid' | 'dietaryGuidelines',
    itemText: string
  ) => {
    if (chartData[listKey].includes(itemText)) return;
    setChartData(prev => ({
      ...prev,
      [listKey]: [...prev[listKey], itemText]
    }));
  };

  // Save / Submit
  const handleSave = async (submitStatus: 'DRAFT' | 'SUBMITTED') => {
    if (!chartData.title.trim()) {
      alert('Please enter a Plan Title');
      return;
    }

    if (submitStatus === 'SUBMITTED') {
      const confirmSubmit = window.confirm(
        'Are you sure you want to finalize and submit this Diet Chart to Admin? Patients and Admin will receive this finalized chart.'
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const isEditing = Boolean(existingFile?.id);
      const url = isEditing
        ? `/api/doctor/patients/${patient.id}/files/${existingFile.id}`
        : `/api/doctor/patients/${patient.id}/files`;

      const method = isEditing ? 'PUT' : 'POST';

      const payload = {
        fileName: isEditing
          ? undefined
          : `DietChart_${chartData.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}_${new Date().toISOString().split('T')[0]}.txt`,
        fileType: 'DIET_CHART',
        fileContent: JSON.stringify(chartData),
        status: submitStatus
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to save diet chart');
      }

      setStatusMessage(submitStatus === 'SUBMITTED' ? 'Diet Chart Submitted Successfully!' : 'Draft Saved Successfully!');
      setTimeout(() => {
        router.push(`/doctor/patients/${patient.id}`);
        router.refresh();
      }, 1200);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error saving diet chart');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .diet-print-view, .diet-print-view * {
            visibility: visible;
          }
          .diet-print-view {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
            break-before: page;
          }
        }

        .diet-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          font-size: 12px;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }
        .diet-chip:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
          color: #0f172a;
        }

        .diet-item-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 6px;
          gap: 12px;
        }
        .diet-item-row:hover {
          background: #ffffff;
          border-color: #cbd5e1;
        }

        .section-header-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
      `}</style>

      {/* TOP BREADCRUMB / ACTION HEADER */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href={`/doctor/patients/${patient.id}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'white', border: '1px solid #cbd5e1', color: '#475569', textDecoration: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </Link>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isViewMode ? 'Diet Chart Print & Preview' : (existingFile ? 'Edit Diet Chart' : 'Create Personalised Diet Chart')}
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Patient: <strong style={{ color: '#0f172a' }}>{patient.name}</strong> • UHID: <strong>{patient.uhid || 'BENVA000123'}</strong> • Dietitian: <strong>{dietitianName}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsViewMode(!isViewMode)}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #0284c7',
              background: isViewMode ? '#e0f2fe' : 'white',
              color: '#0369a1',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            {isViewMode ? 'Back to Editor' : 'Print / Preview'}
          </button>

          {isViewMode && (
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#0f172a',
                color: 'white',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print / Save as PDF
            </button>
          )}

          {!isViewMode && (
            <>
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={isSubmitting}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSave('SUBMITTED')}
                disabled={isSubmitting}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#10b981',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {isSubmitting ? 'Saving...' : 'Submit Diet Chart'}
              </button>
            </>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="no-print" style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', color: '#166534', borderRadius: '8px', marginBottom: '20px', fontWeight: 600, fontSize: '14px' }}>
          ✓ {statusMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: EDIT MODE */}
      {/* ========================================================================= */}
      {!isViewMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* PREDEFINED TEMPLATE SELECTOR BANNER */}
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)', border: '1px solid #86efac', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  ⚡ Quick Predefined Options
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                  Load Predefined Diet Template
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
                  Instantly populates daily meal schedules, inclusions, moderation, exclusions, and guidelines instead of typing from scratch.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <select
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #059669',
                    background: 'white',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    minWidth: '260px'
                  }}
                >
                  <option value="empty">✨ Blank Clean Plan (Empty by default)</option>
                  <option value="pcod">🥗 PCOD Diet Plan (Sample PDF)</option>
                  <option value="weight_loss">🔥 Weight Loss & Fat Loss Plan</option>
                  <option value="diabetes">🩸 Type 2 Diabetes Management Plan</option>
                  <option value="thyroid">🦋 Thyroid & Metabolic Care Plan</option>
                  <option value="hypertension">❤️ Hypertension & DASH Cardiac Plan</option>
                  <option value="general_wellness">🍎 Balanced Nutrition & Wellness Plan</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleApplyTemplate(selectedTemplateKey)}
                  style={{
                    padding: '10px 18px',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  Load Template
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    padding: '10px 16px',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  title="Clear all meal items and food lists to start empty"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>

          {/* BASIC PLAN DETAILS */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              Plan Header Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Diet Plan Title *</label>
                <input
                  type="text"
                  value={chartData.title}
                  onChange={(e) => setChartData({ ...chartData, title: e.target.value })}
                  placeholder="e.g. PCOD DIET PLAN"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Subtitle</label>
                <input
                  type="text"
                  value={chartData.subtitle}
                  onChange={(e) => setChartData({ ...chartData, subtitle: e.target.value })}
                  placeholder="e.g. Personalised Nutrition Chart"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Daily Calorie Target (Optional)</label>
                <input
                  type="text"
                  value={chartData.calorieTarget || ''}
                  onChange={(e) => setChartData({ ...chartData, calorieTarget: e.target.value })}
                  placeholder="e.g. 1400 - 1600 kcal"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Consulting Dietitian</label>
                <input
                  type="text"
                  value={dietitianName}
                  readOnly
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '14px', fontWeight: 600 }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 1: DAILY MEAL SCHEDULE */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Daily Meal Schedule
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Define the timeline of meals, recommended food items, portion sizes, and clinical notes.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Quick Add Slot:</span>
                {QUICK_ADD_OPTIONS.meals.map(m => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => handleAddMeal({ name: m.name, time: m.time })}
                    className="diet-chip"
                    style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}
                  >
                    + {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Slots List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {chartData.meals.map((meal, index) => (
                <div
                  key={meal.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={meal.name}
                        onChange={(e) => handleUpdateMeal(meal.id, 'name', e.target.value)}
                        placeholder="Meal Name (e.g. Early Morning, Breakfast)"
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '14px', flex: 1, minWidth: '140px' }}
                      />
                      <input
                        type="text"
                        value={meal.time}
                        onChange={(e) => handleUpdateMeal(meal.id, 'time', e.target.value)}
                        placeholder="Timing (e.g. 6:00 – 7:00 AM)"
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '160px' }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMeal(meal.id)}
                      style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Delete Slot
                    </button>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Food Items & Menu</label>
                      <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 600 }}>⚡ Click chips below to quick-add foods</span>
                    </div>
                    <textarea
                      rows={3}
                      value={meal.items}
                      onChange={(e) => handleUpdateMeal(meal.id, 'items', e.target.value)}
                      placeholder="List recommended foods, alternatives, ingredients..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', lineHeight: '1.5', fontFamily: 'inherit' }}
                    />

                    {/* Predefined Meal Food Chips */}
                    {(() => {
                      const suggestions = getMealFoodSuggestions(meal.name);
                      if (!suggestions || suggestions.length === 0) return null;
                      return (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1' }}>
                              Predefined {meal.name || 'Meal'} Foods:
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {suggestions.map((food, fIdx) => (
                              <button
                                key={fIdx}
                                type="button"
                                onClick={() => handleAppendMealItem(meal.id, food)}
                                className="diet-chip"
                                title={food}
                                style={{
                                  fontSize: '11px',
                                  padding: '4px 9px',
                                  background: '#f0f9ff',
                                  borderColor: '#bae6fd',
                                  color: '#0369a1'
                                }}
                              >
                                + {food.length > 42 ? `${food.slice(0, 42)}…` : food}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Portion / Serving Size</label>
                      <input
                        type="text"
                        value={meal.serving || ''}
                        onChange={(e) => handleUpdateMeal(meal.id, 'serving', e.target.value)}
                        placeholder="e.g. 1 glass / 500 mL, 2 medium, 1 bowl"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                      {/* Portion Quick Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {QUICK_ADD_OPTIONS.portionSizes?.slice(0, 7).map((psz, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => handleSetMealServing(meal.id, psz)}
                            className="diet-chip"
                            style={{ fontSize: '10.5px', padding: '2px 8px', background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}
                          >
                            {psz}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Special Dietary Note / Caution</label>
                      <input
                        type="text"
                        value={meal.note || ''}
                        onChange={(e) => handleUpdateMeal(meal.id, 'note', e.target.value)}
                        placeholder="e.g. Avoid deep-fried items. Include high-protein source."
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                      {/* Notes Quick Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {QUICK_ADD_OPTIONS.specialNotes?.slice(0, 4).map((note, nIdx) => (
                          <button
                            key={nIdx}
                            type="button"
                            onClick={() => handleAppendMealNote(meal.id, note)}
                            className="diet-chip"
                            title={note}
                            style={{ fontSize: '10.5px', padding: '2px 8px', background: '#fefce8', borderColor: '#fef08a', color: '#854d0e' }}
                          >
                            + {note.length > 32 ? `${note.slice(0, 32)}…` : note}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddMeal()}
                style={{
                  padding: '12px',
                  background: 'white',
                  border: '2px dashed #0284c7',
                  color: '#0284c7',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                + Add Another Meal Slot
              </button>
            </div>
          </div>

          {/* SECTION 2: FOOD CATEGORIES (INCLUDE, MODERATION, AVOID) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>

            {/* FOODS TO BE INCLUDED */}
            <div style={{ background: 'white', border: '1px solid #86efac', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="section-header-banner" style={{ background: '#dcfce7', color: '#166534' }}>
                <span>🟢</span> FOODS TO BE INCLUDED
              </div>

              {/* Suggestions chips */}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '6px' }}>Click to Quick-Add:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_ADD_OPTIONS.foodsToInclude.slice(0, 5).map(opt => (
                    <span
                      key={opt}
                      onClick={() => handleQuickAdd('foodsToInclude', opt)}
                      className="diet-chip"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      + {opt.slice(0, 32)}...
                    </span>
                  ))}
                </div>
              </div>

              {/* Current items */}
              <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '12px' }}>
                {chartData.foodsToInclude.map((item, idx) => (
                  <div key={idx} className="diet-item-row">
                    <span style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.4' }}>• {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('foodsToInclude', idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Item */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newIncludeText}
                  onChange={(e) => setNewIncludeText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem('foodsToInclude', newIncludeText, () => setNewIncludeText('')); } }}
                  placeholder="Add food item to include..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('foodsToInclude', newIncludeText, () => setNewIncludeText(''))}
                  style={{ padding: '8px 14px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* FOODS TO BE CONSUMED IN MODERATION */}
            <div style={{ background: 'white', border: '1px solid #fde047', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="section-header-banner" style={{ background: '#fef9c3', color: '#854d0e' }}>
                <span>🟡</span> IN MODERATION
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#854d0e', display: 'block', marginBottom: '6px' }}>Click to Quick-Add:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_ADD_OPTIONS.foodsInModeration.map(opt => (
                    <span
                      key={opt}
                      onClick={() => handleQuickAdd('foodsInModeration', opt)}
                      className="diet-chip"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      + {opt.slice(0, 30)}...
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '12px' }}>
                {chartData.foodsInModeration.map((item, idx) => (
                  <div key={idx} className="diet-item-row">
                    <span style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.4' }}>• {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('foodsInModeration', idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newModerationText}
                  onChange={(e) => setNewModerationText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem('foodsInModeration', newModerationText, () => setNewModerationText('')); } }}
                  placeholder="Add item in moderation..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('foodsInModeration', newModerationText, () => setNewModerationText(''))}
                  style={{ padding: '8px 14px', background: '#ca8a04', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* FOODS TO BE AVOIDED */}
            <div style={{ background: 'white', border: '1px solid #fca5a5', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="section-header-banner" style={{ background: '#fee2e2', color: '#991b1b' }}>
                <span>🔴</span> FOODS TO BE AVOIDED
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', display: 'block', marginBottom: '6px' }}>Click to Quick-Add:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_ADD_OPTIONS.foodsToAvoid.slice(0, 5).map(opt => (
                    <span
                      key={opt}
                      onClick={() => handleQuickAdd('foodsToAvoid', opt)}
                      className="diet-chip"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      + {opt.slice(0, 30)}...
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '12px' }}>
                {chartData.foodsToAvoid.map((item, idx) => (
                  <div key={idx} className="diet-item-row">
                    <span style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.4' }}>• {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('foodsToAvoid', idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newAvoidText}
                  onChange={(e) => setNewAvoidText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem('foodsToAvoid', newAvoidText, () => setNewAvoidText('')); } }}
                  placeholder="Add food to avoid..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('foodsToAvoid', newAvoidText, () => setNewAvoidText(''))}
                  style={{ padding: '8px 14px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            </div>

          </div>

          {/* SECTION 3: DIETARY GUIDELINES & FOLLOW UP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>

            {/* DIETARY GUIDELINES */}
            <div style={{ background: 'white', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="section-header-banner" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                <span>ℹ️</span> DIETARY & LIFESTYLE GUIDELINES
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', display: 'block', marginBottom: '6px' }}>Click to Quick-Add:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_ADD_OPTIONS.dietaryGuidelines.slice(0, 4).map(opt => (
                    <span
                      key={opt}
                      onClick={() => handleQuickAdd('dietaryGuidelines', opt)}
                      className="diet-chip"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      + {opt.slice(0, 32)}...
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '12px' }}>
                {chartData.dietaryGuidelines.map((item, idx) => (
                  <div key={idx} className="diet-item-row">
                    <span style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.4' }}>• {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('dietaryGuidelines', idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newGuidelineText}
                  onChange={(e) => setNewGuidelineText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem('dietaryGuidelines', newGuidelineText, () => setNewGuidelineText('')); } }}
                  placeholder="Add lifestyle / physical guideline..."
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => handleAddItem('dietaryGuidelines', newGuidelineText, () => setNewGuidelineText(''))}
                  style={{ padding: '8px 14px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* FOLLOW UP & SIGNATURE BLOCK */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="section-header-banner" style={{ background: '#f1f5f9', color: '#334155' }}>
                  <span>⏱️</span> FOLLOW-UP & CONSULTATION REVIEWS
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Follow-up Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={chartData.followUp}
                    onChange={(e) => setChartData({ ...chartData, followUp: e.target.value })}
                    placeholder="e.g. Regular follow-up for at least 3 months to monitor blood glucose levels and assess progress."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit', lineHeight: '1.4' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Signed By</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{dietitianName}</div>
                <div style={{ fontSize: '13px', color: '#475569' }}>Consulting Dietitian, BENVA Health Care</div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: PRINT & FULL NUTRITION CHART VIEW (MATCHING PDF SAMPLE) */}
      {/* ========================================================================= */}
      {isViewMode && (
        <div
          className="diet-print-view"
          style={{
            background: 'white',
            maxWidth: '850px',
            margin: '0 auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            padding: '36px',
            color: '#1e293b',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* HEADER (PAGE 1) */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img
              src="/images/Benva%20NEW.png"
              alt="BENVA HEALTH CARE"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* BLUE TITLE BLOCK */}
          <div style={{ background: '#1e3a8a', color: 'white', textAlign: 'center', padding: '14px 20px', borderRadius: '4px', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '1px' }}>{chartData.title}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#93c5fd', fontWeight: 500 }}>{chartData.subtitle}</p>
          </div>

          {/* PATIENT DETAILS TABLE */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                <td style={{ padding: '8px 12px', width: '25%' }}>PATIENT NAME</td>
                <td style={{ padding: '8px 12px', width: '25%' }}>UHID</td>
                <td style={{ padding: '8px 12px', width: '25%' }}>AGE</td>
                <td style={{ padding: '8px 12px', width: '25%' }}>DIETITIAN</td>
              </tr>
              <tr style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                <td style={{ padding: '8px 12px' }}>{patient.name}</td>
                <td style={{ padding: '8px 12px' }}>{patient.uhid || 'BENVA000123'}</td>
                <td style={{ padding: '8px 12px' }}>{patient.age ? `${patient.age} Years` : '28 Years'}</td>
                <td style={{ padding: '8px 12px' }}>{dietitianName}</td>
              </tr>
            </tbody>
          </table>

          {/* DAILY MEAL SCHEDULE */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ background: '#0284c7', color: 'white', padding: '8px 14px', fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
              DAILY MEAL SCHEDULE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chartData.meals.map((meal) => (
                <div
                  key={meal.id}
                  style={{
                    display: 'flex',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: '180px',
                      background: '#0f4c81',
                      color: 'white',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600 }}>{meal.time}</span>
                    <strong style={{ fontSize: '15px', marginTop: '2px' }}>{meal.name}</strong>
                  </div>

                  <div style={{ flex: 1, padding: '12px 16px', background: '#ffffff' }}>
                    <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#1e293b', whiteSpace: 'pre-line' }}>
                      {meal.items}
                    </div>

                    {meal.serving && (
                      <div style={{ marginTop: '6px', fontSize: '12px', color: '#0284c7', fontWeight: 600 }}>
                        Serving: {meal.serving}
                      </div>
                    )}

                    {meal.note && (
                      <div style={{ marginTop: '6px', padding: '6px 10px', background: '#f8fafc', borderLeft: '3px solid #0284c7', fontSize: '12px', color: '#475569', fontStyle: 'italic', lineHeight: '1.5' }}>
                        <strong>Note:</strong> {meal.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAGE BREAK FOR PRINT */}
          <div className="page-break" style={{ height: '24px' }}></div>

          {/* FOODS TO BE INCLUDED (GREEN) */}
          <div style={{ border: '1px solid #86efac', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px 14px', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🍏</span> FOODS TO BE INCLUDED
            </div>
            <div style={{ padding: '14px 18px', background: 'white' }}>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.7', color: '#1e293b' }}>
                {chartData.foodsToInclude.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* FOODS TO BE CONSUMED IN MODERATION (AMBER) */}
          <div style={{ border: '1px solid #fde047', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ background: '#fef9c3', color: '#854d0e', padding: '8px 14px', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span> FOODS TO BE CONSUMED IN MODERATION
            </div>
            <div style={{ padding: '14px 18px', background: 'white' }}>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.7', color: '#1e293b' }}>
                {chartData.foodsInModeration.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* FOODS TO BE AVOIDED (RED) */}
          <div style={{ border: '1px solid #fca5a5', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 14px', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚫</span> FOODS TO BE AVOIDED
            </div>
            <div style={{ padding: '14px 18px', background: 'white' }}>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.7', color: '#1e293b' }}>
                {chartData.foodsToAvoid.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* PAGE BREAK FOR PRINT */}
          <div className="page-break" style={{ height: '24px' }}></div>

          {/* DIETARY GUIDELINES (BLUE) */}
          <div style={{ border: '1px solid #bae6fd', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px 14px', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ℹ️</span> DIETARY & LIFESTYLE GUIDELINES
            </div>
            <div style={{ padding: '14px 18px', background: 'white' }}>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.7', color: '#1e293b' }}>
                {chartData.dietaryGuidelines.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* FOLLOW UP */}
          {chartData.followUp && (
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
              <div style={{ background: '#f1f5f9', color: '#334155', padding: '8px 14px', fontWeight: 800, fontSize: '13px' }}>
                FOLLOW-UP
              </div>
              <div style={{ padding: '12px 18px', background: 'white', fontSize: '13px', color: '#1e293b', lineHeight: '1.6' }}>
                {chartData.followUp}
              </div>
            </div>
          )}

          {/* SIGNATURE BLOCK */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '36px', marginBottom: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{dietitianName}</div>
              <div style={{ fontSize: '13px', color: '#475569' }}>Consulting Dietitian, BENVA Health Care</div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
            <span>Confidential Patient Document</span>
            <span style={{ fontWeight: 600 }}>BENVA HEALTH CARE</span>
            <span>Personalised Nutrition Care</span>
          </div>

        </div>
      )}

    </div>
  );
}

