'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PREDEFINED_DIET_TEMPLATES,
  QUICK_ADD_OPTIONS,
  STANDARD_TIME_SLOTS,
  TIME_SLOTS_BY_MEAL,
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

  // Custom options persisted in localStorage
  const [customFoodByCategory, setCustomFoodByCategory] = useState<Record<string, string[]>>({});
  const [customPortions, setCustomPortions] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState<string[]>([]);
  const [customTemplates, setCustomTemplates] = useState<Record<string, DietPlanData>>({});

  // Active inline input states for meal slot custom additions
  const [activeAddingFoodMealId, setActiveAddingFoodMealId] = useState<string | null>(null);
  const [tempFoodText, setTempFoodText] = useState('');

  const [activeAddingPortionMealId, setActiveAddingPortionMealId] = useState<string | null>(null);
  const [tempPortionText, setTempPortionText] = useState('');

  const [activeAddingNoteMealId, setActiveAddingNoteMealId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Quick add custom slot state
  const [isAddingCustomSlot, setIsAddingCustomSlot] = useState(false);
  const [customSlotName, setCustomSlotName] = useState('');
  const [customSlotTime, setCustomSlotTime] = useState('');

  // PDF direct download ref & state
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    const element = pdfContentRef.current;
    if (!element) {
      window.print();
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const html2pdfModule = (await import('html2pdf.js')).default;
      const cleanName = (patient.name || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
      const uhidClean = (patient.uhid || 'UHID').replace(/[^a-zA-Z0-9_-]/g, '_');

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `BENVA_Diet_Chart_${cleanName}_${uhidClean}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          ignoreElements: (element: Element) => {
            return element.classList?.contains('no-print') || element.tagName === 'BUTTON';
          }
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: {
          mode: ['css'],
          before: '.diet-page-break',
          avoid: '.diet-page'
        }
      };

      await html2pdfModule().set(opt).from(element).save();
    } catch (err) {
      console.error('Direct PDF download error, falling back to print:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Load custom options from localStorage on mount
  React.useEffect(() => {
    try {
      const savedFoods = localStorage.getItem('benva_custom_food_suggestions');
      if (savedFoods) setCustomFoodByCategory(JSON.parse(savedFoods));

      const savedPortions = localStorage.getItem('benva_custom_portion_suggestions');
      if (savedPortions) setCustomPortions(JSON.parse(savedPortions));

      const savedNotes = localStorage.getItem('benva_custom_notes_suggestions');
      if (savedNotes) setCustomNotes(JSON.parse(savedNotes));

      const savedTemplates = localStorage.getItem('benva_custom_diet_templates');
      if (savedTemplates) setCustomTemplates(JSON.parse(savedTemplates));
    } catch (e) {
      console.warn('Failed to load customizations from localStorage', e);
    }
  }, []);

  // Format dietitian title
  const rawDoctorName = doctor?.name || patient?.consultant || 'Dietitian';
  const isDtPrefixed = rawDoctorName.toLowerCase().startsWith('dt.') || rawDoctorName.toLowerCase().startsWith('dt ');
  const dietitianName = isDtPrefixed ? rawDoctorName : `Dt. ${rawDoctorName}`;

  // Parse patient's previous diet charts for easy follow-up access
  const pastDietCharts = React.useMemo(() => {
    return (patient?.files || [])
      .filter((f: any) => f.id !== existingFile?.id && (f.fileType === 'DIET_CHART' || f.fileName?.toLowerCase().includes('diet')))
      .map((f: any) => {
        let parsed: any = null;
        if (f.fileUrl && f.fileUrl.startsWith('data:')) {
          try {
            const base64Data = f.fileUrl.split(',')[1];
            const decoded = atob(base64Data);
            parsed = JSON.parse(decoded);
          } catch (e) {}
        }
        return { ...f, parsedData: parsed };
      });
  }, [patient?.files, existingFile?.id]);

  // Handle template selection
  const handleApplyTemplate = (templateKey: string) => {
    if (templateKey === 'empty') {
      setChartData(createEmptyDietChart());
      return;
    }

    if (templateKey.startsWith('past_')) {
      const pastId = templateKey.replace('past_', '');
      const past = pastDietCharts.find(p => p.id === pastId);
      if (past?.parsedData) {
        setChartData(JSON.parse(JSON.stringify(past.parsedData)));
        alert(`✓ Loaded patient's previous diet chart from ${formatDate(past.createdAt || past.updatedAt)}!`);
        return;
      }
    }

    if (templateKey.startsWith('custom_')) {
      const customName = templateKey.replace('custom_', '');
      const tpl = customTemplates[customName];
      if (tpl) {
        setChartData(JSON.parse(JSON.stringify(tpl)));
        return;
      }
    }

    const template = PREDEFINED_DIET_TEMPLATES[templateKey];
    if (template) {
      setChartData(JSON.parse(JSON.stringify(template)));
    }
  };

  const handleSaveAsCustomTemplate = () => {
    const name = window.prompt('Enter a name for this custom template (e.g. My Thyroid Special Plan):');
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    const updated = { ...customTemplates, [trimmed]: JSON.parse(JSON.stringify(chartData)) };
    setCustomTemplates(updated);
    try {
      localStorage.setItem('benva_custom_diet_templates', JSON.stringify(updated));
    } catch (e) {}
    setSelectedTemplateKey(`custom_${trimmed}`);
    alert(`Template "${trimmed}" saved! You can load it anytime from the template dropdown.`);
  };

  const handleDeleteCustomTemplate = (customName: string) => {
    if (window.confirm(`Delete custom template "${customName}"?`)) {
      const copy = { ...customTemplates };
      delete copy[customName];
      setCustomTemplates(copy);
      try {
        localStorage.setItem('benva_custom_diet_templates', JSON.stringify(copy));
      } catch (e) {}
      setSelectedTemplateKey('empty');
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

  const getMealCategoryKey = (mealName: string): string => {
    const lower = (mealName || '').toLowerCase();
    if (lower.includes('early') || lower.includes('wakeup') || lower.includes('wake-up') || (lower.includes('morning') && !lower.includes('mid') && !lower.includes('break'))) {
      return 'earlyMorning';
    }
    if (lower.includes('breakfast') || lower.includes('brunch')) {
      return 'breakfast';
    }
    if (lower.includes('mid') || lower.includes('snack') || lower.includes('11')) {
      return 'midMorning';
    }
    if (lower.includes('lunch') || lower.includes('afternoon') || lower.includes('noon')) {
      return 'lunch';
    }
    if (lower.includes('evening') || lower.includes('tea') || lower.includes('4:') || lower.includes('5:')) {
      return 'evening';
    }
    if (lower.includes('dinner') || lower.includes('night') || lower.includes('supper') || lower.includes('7:') || lower.includes('8:')) {
      return 'dinner';
    }
    if (lower.includes('bed') || lower.includes('sleep') || lower.includes('9:')) {
      return 'beforeBed';
    }
    return 'general';
  };

  const getMealFoodSuggestions = (mealName: string): { defaultItems: string[]; customItems: string[] } => {
    const catKey = getMealCategoryKey(mealName);
    const cat = QUICK_ADD_OPTIONS.mealItemsByCategory as Record<string, string[]>;
    const defaultItems = cat ? (cat[catKey] || cat.general || []) : [];
    const customItems = customFoodByCategory[catKey] || [];
    return { defaultItems, customItems };
  };

  const handleAddCustomFoodItem = (mealId: string, mealName: string, foodText: string) => {
    const text = foodText.trim();
    if (!text) return;
    const catKey = getMealCategoryKey(mealName);
    const currentList = customFoodByCategory[catKey] || [];
    if (!currentList.includes(text)) {
      const updated = { ...customFoodByCategory, [catKey]: [...currentList, text] };
      setCustomFoodByCategory(updated);
      try {
        localStorage.setItem('benva_custom_food_suggestions', JSON.stringify(updated));
      } catch (e) {}
    }
    handleToggleMealItem(mealId, text);
    setTempFoodText('');
    setActiveAddingFoodMealId(null);
  };

  const handleRemoveCustomFoodItem = (mealName: string, foodText: string) => {
    const catKey = getMealCategoryKey(mealName);
    const currentList = customFoodByCategory[catKey] || [];
    const updated = { ...customFoodByCategory, [catKey]: currentList.filter(f => f !== foodText) };
    setCustomFoodByCategory(updated);
    try {
      localStorage.setItem('benva_custom_food_suggestions', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAddCustomPortion = (mealId: string, portionText: string) => {
    const text = portionText.trim();
    if (!text) return;
    if (!customPortions.includes(text)) {
      const updated = [...customPortions, text];
      setCustomPortions(updated);
      try {
        localStorage.setItem('benva_custom_portion_suggestions', JSON.stringify(updated));
      } catch (e) {}
    }
    handleToggleMealServing(mealId, text);
    setTempPortionText('');
    setActiveAddingPortionMealId(null);
  };

  const handleAddCustomNote = (mealId: string, noteText: string) => {
    const text = noteText.trim();
    if (!text) return;
    if (!customNotes.includes(text)) {
      const updated = [...customNotes, text];
      setCustomNotes(updated);
      try {
        localStorage.setItem('benva_custom_notes_suggestions', JSON.stringify(updated));
      } catch (e) {}
    }
    handleToggleMealNote(mealId, text);
    setTempNoteText('');
    setActiveAddingNoteMealId(null);
  };

  const getTimeSlotsForMeal = (mealName: string): { label: string; slots: string[] } => {
    const lower = (mealName || '').toLowerCase();
    if (lower.includes('early') || lower.includes('wakeup') || lower.includes('wake-up') || (lower.includes('morning') && !lower.includes('mid') && !lower.includes('break'))) {
      return { label: 'Early Morning Timings', slots: TIME_SLOTS_BY_MEAL.earlyMorning || [] };
    }
    if (lower.includes('breakfast') || lower.includes('brunch')) {
      return { label: 'Breakfast Timings', slots: TIME_SLOTS_BY_MEAL.breakfast || [] };
    }
    if (lower.includes('mid') || lower.includes('11')) {
      return { label: 'Mid-Morning Timings', slots: TIME_SLOTS_BY_MEAL.midMorning || [] };
    }
    if (lower.includes('lunch') || lower.includes('afternoon') || lower.includes('noon')) {
      return { label: 'Lunch Timings', slots: TIME_SLOTS_BY_MEAL.lunch || [] };
    }
    if (lower.includes('evening') || lower.includes('tea') || lower.includes('snack') || lower.includes('4:') || lower.includes('5:')) {
      return { label: 'Evening Timings', slots: TIME_SLOTS_BY_MEAL.evening || [] };
    }
    if (lower.includes('dinner') || lower.includes('night') || lower.includes('supper') || lower.includes('7:') || lower.includes('8:')) {
      return { label: 'Dinner Timings', slots: TIME_SLOTS_BY_MEAL.dinner || [] };
    }
    if (lower.includes('bed') || lower.includes('sleep') || lower.includes('9:')) {
      return { label: 'Before Bed Timings', slots: TIME_SLOTS_BY_MEAL.beforeBed || [] };
    }
    return { label: 'Standard Timings', slots: STANDARD_TIME_SLOTS };
  };

  const getDynamicRows = (text: string, minRows: number = 2) => {
    if (!text) return minRows;
    const lines = text.split('\n');
    const estimatedRows = lines.reduce((total, line) => {
      const wrapped = Math.max(1, Math.ceil(line.length / 80));
      return total + wrapped;
    }, 0);
    return Math.max(minRows, estimatedRows);
  };

  const formatPatientAge = (age: string | null | undefined): string => {
    if (!age) return '28 Years';
    const clean = age.trim();
    if (clean.toLowerCase().includes('yr') || clean.toLowerCase().includes('year')) {
      return clean.replace(/yrs?/i, 'Years');
    }
    return `${clean} Years`;
  };

  const formatPatientUhid = (uhid: string | null | undefined): string => {
    if (!uhid) return 'BENVA000123';
    return uhid;
  };

  const renderGuidelineIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('grain') || lower.includes('millet') || lower.includes('oat') || lower.includes('wheat') || lower.includes('rice')) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 22 10-10"></path>
          <path d="M16 8a6 6 0 0 1-6 6"></path>
          <path d="M18 6a6 6 0 0 1-6 6"></path>
          <path d="M20 4a6 6 0 0 1-6 6"></path>
        </svg>
      );
    }
    if (lower.includes('protein') || lower.includes('egg') || lower.includes('chicken') || lower.includes('paneer') || lower.includes('dal') || lower.includes('tofu')) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="4"></circle>
          <line x1="12" y1="2" x2="12" y2="4"></line>
          <line x1="12" y1="20" x2="12" y2="22"></line>
        </svg>
      );
    }
    if (lower.includes('meal') || lower.includes('frequent') || lower.includes('portion') || lower.includes('plate') || lower.includes('overeat')) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 3v18"></path>
          <path d="M3 12h18"></path>
        </svg>
      );
    }
    if (lower.includes('skip') || lower.includes('fasting') || lower.includes('time') || lower.includes('timing') || lower.includes('hour') || lower.includes('consistent')) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      );
    }
    if (lower.includes('active') || lower.includes('exercise') || lower.includes('physical') || lower.includes('walk') || lower.includes('gym') || lower.includes('strength') || lower.includes('training')) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5 17.5 17.5"></path>
          <path d="m21 21-1-1a3 3 0 0 0-4.24 0l-.76.76a3 3 0 0 1-4.24 0l-5-5a3 3 0 0 1 0-4.24l.76-.76a3 3 0 0 0 0-4.24L6.5 6.5"></path>
        </svg>
      );
    }
    if (lower.includes('sleep') || lower.includes('rest') || lower.includes('bed')) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      );
    }
    if (lower.includes('hydrat') || lower.includes('water') || lower.includes('fluid') || lower.includes('litr')) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
      );
    }
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    );
  };

  const cleanItemString = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/^[•\-\*\s]+/, '')
      .replace(/[\.\,\;\:\s]+$/, '')
      .trim();
  };

  const isFoodItemAdded = (currentText: string | undefined, foodText: string): boolean => {
    if (!currentText || !foodText) return false;
    const target = cleanItemString(foodText);
    if (!target) return false;
    const lines = currentText.split('\n').map(l => cleanItemString(l)).filter(Boolean);
    return lines.some(line => line === target || line.includes(target) || target.includes(line));
  };

  const handleToggleMealItem = (mealId: string, item: string) => {
    setChartData(prev => ({
      ...prev,
      meals: prev.meals.map(m => {
        if (m.id !== mealId) return m;
        const current = (m.items || '').trim();
        const target = cleanItemString(item);

        if (isFoodItemAdded(current, item)) {
          // Toggle OFF (remove line)
          const remainingLines = (m.items || '')
            .split('\n')
            .filter(line => {
              const cleanLine = cleanItemString(line);
              if (!cleanLine) return false;
              return !(cleanLine === target || cleanLine.includes(target) || target.includes(cleanLine));
            });
          return { ...m, items: remainingLines.join('\n') };
        } else {
          // Toggle ON (append)
          if (!current) return { ...m, items: item };
          const prefix = current.includes('•') ? '\n• ' : '\n';
          return { ...m, items: `${current}${prefix}${item.replace(/^•\s*/, '')}` };
        }
      })
    }));
  };

  const handleToggleMealServing = (mealId: string, serving: string) => {
    setChartData(prev => ({
      ...prev,
      meals: prev.meals.map(m => {
        if (m.id !== mealId) return m;
        const current = (m.serving || '').trim().toLowerCase();
        const target = serving.trim().toLowerCase();
        return { ...m, serving: current === target ? '' : serving };
      })
    }));
  };

  const isMealNoteAdded = (currentText: string | undefined, noteText: string): boolean => {
    if (!currentText || !noteText) return false;
    const target = cleanItemString(noteText);
    if (!target) return false;
    const lines = currentText.split('\n').map(l => cleanItemString(l)).filter(Boolean);
    return lines.some(line => line === target || line.includes(target) || target.includes(line));
  };

  const handleToggleMealNote = (mealId: string, note: string) => {
    setChartData(prev => ({
      ...prev,
      meals: prev.meals.map(m => {
        if (m.id !== mealId) return m;
        const current = (m.note || '').trim();
        const cleanNote = note.replace(/^[•\-\*]\s*/, '').trim();
        const target = cleanItemString(note);

        if (isMealNoteAdded(current, note)) {
          // Toggle OFF (remove note)
          const remainingLines = (m.note || '')
            .split('\n')
            .filter(line => {
              const cleanLine = cleanItemString(line);
              if (!cleanLine) return false;
              return !(cleanLine === target || cleanLine.includes(target) || target.includes(cleanLine));
            });
          return { ...m, note: remainingLines.join('\n') };
        } else {
          // Toggle ON (append note)
          if (!current) return { ...m, note: `• ${cleanNote}` };
          return { ...m, note: `${current}\n• ${cleanNote}` };
        }
      })
    }));
  };

  // List management helpers
  const isListOptionAdded = (
    listKey: 'foodsToInclude' | 'foodsInModeration' | 'foodsToAvoid' | 'dietaryGuidelines',
    opt: string
  ): boolean => {
    const target = cleanItemString(opt);
    if (!target) return false;
    return chartData[listKey].some(item => {
      const clean = cleanItemString(item);
      return clean === target || clean.includes(target) || target.includes(clean);
    });
  };

  const handleAddItem = (
    listKey: 'foodsToInclude' | 'foodsInModeration' | 'foodsToAvoid' | 'dietaryGuidelines',
    text: string,
    clearFn: () => void
  ) => {
    if (!text.trim()) return;
    const target = cleanItemString(text);
    if (chartData[listKey].some(item => cleanItemString(item) === target)) {
      alert('This item is already added to the list.');
      return;
    }
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

  const handleToggleListOption = (
    listKey: 'foodsToInclude' | 'foodsInModeration' | 'foodsToAvoid' | 'dietaryGuidelines',
    itemText: string
  ) => {
    const target = cleanItemString(itemText);
    const exists = isListOptionAdded(listKey, itemText);

    if (exists) {
      // Toggle OFF: remove from list
      setChartData(prev => ({
        ...prev,
        [listKey]: prev[listKey].filter(item => {
          const clean = cleanItemString(item);
          return !(clean === target || clean.includes(target) || target.includes(clean));
        })
      }));
    } else {
      // Toggle ON: add to list
      setChartData(prev => ({
        ...prev,
        [listKey]: [...prev[listKey], itemText]
      }));
    }
  };

  // Backward compatibility aliases
  const handleAppendMealItem = handleToggleMealItem;
  const handleSetMealServing = handleToggleMealServing;
  const handleAppendMealNote = handleToggleMealNote;
  const handleQuickAdd = handleToggleListOption;

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
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .diet-print-view {
            width: 210mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            display: block !important;
          }
          .diet-pages-printable {
            width: 210mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
          .diet-page {
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 10mm 14mm 8mm 14mm !important;
            display: flex !important;
            flex-direction: column !important;
            justifyContent: space-between !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            border-radius: 0 !important;
            background: white !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .diet-page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
        }

        .diet-page {
          box-sizing: border-box;
          page-break-inside: avoid;
          break-inside: avoid;
          page-break-after: avoid;
          break-after: avoid;
        }
        .diet-page-break {
          page-break-before: always;
          break-before: page;
        }

        .print-blue-title {
          background-color: #0c3b6d !important;
          box-shadow: inset 0 0 0 1000px #0c3b6d !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: #ffffff !important;
        }
        .print-blue-banner {
          background-color: #0c4a7f !important;
          box-shadow: inset 0 0 0 1000px #0c4a7f !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: #ffffff !important;
        }
        .print-red-bar {
          background-color: #dc2626 !important;
          box-shadow: inset 0 0 0 1000px #dc2626 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-green-banner {
          background-color: #eafaf1 !important;
          box-shadow: inset 0 0 0 1000px #eafaf1 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: #166534 !important;
        }
        .print-amber-banner {
          background-color: #fef9c3 !important;
          box-shadow: inset 0 0 0 1000px #fef9c3 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: #854d0e !important;
        }
        .print-avoid-banner {
          background-color: #fee2e2 !important;
          box-shadow: inset 0 0 0 1000px #fee2e2 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: #991b1b !important;
        }
        .print-sky-banner {
          background-color: #e0f2fe !important;
          box-shadow: inset 0 0 0 1000px #e0f2fe !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: #0369a1 !important;
        }
        .print-sky-pill {
          background-color: #0284c7 !important;
          box-shadow: inset 0 0 0 1000px #0284c7 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: #ffffff !important;
        }
        .print-followup-box {
          background-color: #f0f9ff !important;
          box-shadow: inset 0 0 0 1000px #f0f9ff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-table-header {
          background-color: #f8fafc !important;
          box-shadow: inset 0 0 0 1000px #f8fafc !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
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
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0284c7',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF (Full Color)'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Print via Browser
              </button>
            </div>
          )}

          {!isViewMode && (
            <>
              {pastDietCharts.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const latest = pastDietCharts[0];
                    if (latest?.parsedData) {
                      if (confirm(`Load patient's previous diet chart from ${formatDate(latest.createdAt || latest.updatedAt)}? This will load their previous meal schedule and guidelines.`)) {
                        setChartData(JSON.parse(JSON.stringify(latest.parsedData)));
                        alert('✓ Loaded previous diet chart!');
                      }
                    }
                  }}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Directly load patient's previous diet chart without needing patient upload"
                >
                  📋 Load Old Chart ({formatDate(pastDietCharts[0].createdAt || pastDietCharts[0].updatedAt)})
                </button>
              )}

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
                  {pastDietCharts.length > 0 && (
                    <optgroup label="📋 Patient's Previous Diet Charts">
                      {pastDietCharts.map((past: any) => (
                        <option key={past.id} value={`past_${past.id}`}>
                          📋 Previous Chart ({formatDate(past.createdAt || past.updatedAt)})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Clinical Presets">
                    <option value="pcod">🥗 PCOD Diet Plan (Sample PDF)</option>
                    <option value="weight_loss">🔥 Weight Loss & Fat Loss Plan</option>
                    <option value="diabetes">🩸 Type 2 Diabetes Management Plan</option>
                    <option value="thyroid">🦋 Thyroid & Metabolic Care Plan</option>
                    <option value="hypertension">❤️ Hypertension & DASH Cardiac Plan</option>
                    <option value="general_wellness">🍎 Balanced Nutrition & Wellness Plan</option>
                  </optgroup>
                  {Object.keys(customTemplates).length > 0 && (
                    <optgroup label="⭐ My Custom Saved Templates">
                      {Object.keys(customTemplates).map(tplName => (
                        <option key={tplName} value={`custom_${tplName}`}>
                          ⭐ {tplName}
                        </option>
                      ))}
                    </optgroup>
                  )}
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

                {pastDietCharts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const latest = pastDietCharts[0];
                      if (latest?.parsedData) {
                        if (confirm(`Load patient's previous diet chart from ${formatDate(latest.createdAt || latest.updatedAt)}? This will load their previous meal schedule and guidelines.`)) {
                          setChartData(JSON.parse(JSON.stringify(latest.parsedData)));
                          alert('✓ Loaded previous diet chart!');
                        }
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    title="Directly load patient's previous plan without needing patient upload"
                  >
                    📋 Load Old Chart ({formatDate(pastDietCharts[0].createdAt || pastDietCharts[0].updatedAt)})
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveAsCustomTemplate}
                  style={{
                    padding: '10px 14px',
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                  title="Save the current diet chart as a reusable custom template"
                >
                  💾 Save as Custom Template
                </button>

                {selectedTemplateKey.startsWith('custom_') && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomTemplate(selectedTemplateKey.replace('custom_', ''))}
                    style={{
                      padding: '10px 12px',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    title="Delete this custom template"
                  >
                    Delete Template
                  </button>
                )}

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

            {/* Patient Record Information */}
            <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Patient Name</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{patient.name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>UHID</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7', whiteSpace: 'nowrap' }}>{formatPatientUhid(patient.uhid)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Age</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{formatPatientAge(patient.age)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Gender</span>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{patient.gender || 'Not Specified'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Phone</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{patient.phone}</div>
                </div>
              </div>
              <span style={{ fontSize: '11.5px', color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                ✓ Linked to Patient Profile
              </span>
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
                {QUICK_ADD_OPTIONS.meals.map(m => {
                  const isAdded = chartData.meals.some(
                    meal => cleanItemString(meal.name) === cleanItemString(m.name)
                  );
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => handleAddMeal({ name: m.name, time: m.time })}
                      className="diet-chip"
                      title={isAdded ? `✓ ${m.name} is in the schedule (click to add another)` : `Click to add ${m.name} slot`}
                      style={{
                        background: isAdded ? '#dcfce7' : '#ecfdf5',
                        color: isAdded ? '#15803d' : '#065f46',
                        borderColor: isAdded ? '#86efac' : '#a7f3d0',
                        fontWeight: isAdded ? 700 : 500,
                        boxShadow: isAdded ? '0 1px 2px rgba(22, 101, 52, 0.12)' : 'none'
                      }}
                    >
                      {isAdded ? `✓ ${m.name}` : `+ ${m.name}`}
                    </button>
                  );
                })}

                {!isAddingCustomSlot ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomSlot(true)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px dashed #0284c7',
                      background: '#f0f9ff',
                      color: '#0284c7',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Custom Slot
                  </button>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0f9ff', padding: '3px 8px', borderRadius: '6px', border: '1px solid #7dd3fc' }}>
                    <input
                      type="text"
                      placeholder="Slot Name (e.g. Snack 2)"
                      value={customSlotName}
                      onChange={(e) => setCustomSlotName(e.target.value)}
                      style={{ padding: '3px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '130px' }}
                    />
                    <input
                      type="text"
                      placeholder="Timing (e.g. 5:30 PM)"
                      value={customSlotTime}
                      onChange={(e) => setCustomSlotTime(e.target.value)}
                      style={{ padding: '3px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '110px' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customSlotName.trim()) {
                          handleAddMeal({ name: customSlotName.trim(), time: customSlotTime.trim() || 'Custom Timing' });
                          setCustomSlotName('');
                          setCustomSlotTime('');
                          setIsAddingCustomSlot(false);
                        }
                      }}
                      style={{ padding: '3px 8px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomSlot(false)}
                      style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '12px' }}
                    >
                      ✕
                    </button>
                  </div>
                )}
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
                      {(() => {
                        const timeConfig = getTimeSlotsForMeal(meal.name);
                        const relevantSlots = timeConfig.slots;
                        const isPresetSlot = relevantSlots.includes(meal.time);

                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <select
                              value={isPresetSlot ? meal.time : (meal.time ? 'custom' : '')}
                              onChange={(e) => {
                                if (e.target.value === 'custom') {
                                  if (isPresetSlot) {
                                    handleUpdateMeal(meal.id, 'time', '');
                                  }
                                } else {
                                  handleUpdateMeal(meal.id, 'time', e.target.value);
                                }
                              }}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13px',
                                fontWeight: 600,
                                background: 'white',
                                color: '#0f172a',
                                cursor: 'pointer',
                                minWidth: '180px'
                              }}
                            >
                              <option value="">⏱️ Select {meal.name || 'Meal'} Timing...</option>
                              <optgroup label={timeConfig.label}>
                                {relevantSlots.map(slot => (
                                  <option key={slot} value={slot}>{slot}</option>
                                ))}
                              </optgroup>
                              {meal.time && !isPresetSlot && (
                                <option value={meal.time}>{meal.time}</option>
                              )}
                              <option value="custom">✏️ Custom Time...</option>
                            </select>

                            {(!isPresetSlot) && (
                              <input
                                type="text"
                                value={meal.time}
                                onChange={(e) => handleUpdateMeal(meal.id, 'time', e.target.value)}
                                placeholder="Type timing (e.g. 6:15 AM)"
                                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '150px' }}
                              />
                            )}
                          </div>
                        );
                      })()}
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
                      rows={getDynamicRows(meal.items, 3)}
                      value={meal.items}
                      onChange={(e) => handleUpdateMeal(meal.id, 'items', e.target.value)}
                      placeholder="List recommended foods, alternatives, ingredients..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />

                    {/* Predefined & Custom Meal Food Chips */}
                    {(() => {
                      const { defaultItems, customItems } = getMealFoodSuggestions(meal.name);
                      const isAdding = activeAddingFoodMealId === meal.id;

                      return (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1' }}>
                              Predefined & Custom {meal.name || 'Meal'} Foods:
                            </span>

                            {!isAdding ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveAddingFoodMealId(meal.id);
                                  setTempFoodText('');
                                }}
                                style={{
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  background: '#e0f2fe',
                                  color: '#0284c7',
                                  border: '1px dashed #0284c7',
                                  borderRadius: '6px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                + Add Custom Food Option
                              </button>
                            ) : null}
                          </div>

                          {/* Inline Custom Food Input Form */}
                          {isAdding && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '8px',
                              padding: '8px 12px',
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              borderRadius: '8px'
                            }}>
                              <input
                                type="text"
                                value={tempFoodText}
                                onChange={(e) => setTempFoodText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustomFoodItem(meal.id, meal.name, tempFoodText);
                                  }
                                }}
                                placeholder="Type new food item (e.g. 1 bowl roasted makhana)..."
                                autoFocus
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #93c5fd',
                                  fontSize: '12px',
                                  outline: 'none'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddCustomFoodItem(meal.id, meal.name, tempFoodText)}
                                style={{
                                  padding: '6px 12px',
                                  background: '#0284c7',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Add Option
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveAddingFoodMealId(null);
                                  setTempFoodText('');
                                }}
                                style={{
                                  padding: '6px 10px',
                                  background: 'white',
                                  color: '#64748b',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {/* Predefined Food Chips */}
                            {defaultItems.map((food, fIdx) => {
                              const isAdded = isFoodItemAdded(meal.items, food);
                              return (
                                <button
                                  key={`def_${fIdx}`}
                                  type="button"
                                  onClick={() => handleToggleMealItem(meal.id, food)}
                                  className="diet-chip"
                                  title={isAdded ? `✓ Already added — click to remove "${food}"` : `Click to add "${food}"`}
                                  style={{
                                    fontSize: '11px',
                                    padding: '4px 10px',
                                    background: isAdded ? '#dcfce7' : '#f0f9ff',
                                    borderColor: isAdded ? '#86efac' : '#bae6fd',
                                    color: isAdded ? '#15803d' : '#0369a1',
                                    fontWeight: isAdded ? 700 : 500,
                                    boxShadow: isAdded ? '0 1px 2px rgba(22, 101, 52, 0.12)' : 'none'
                                  }}
                                >
                                  {isAdded ? '✓ ' : '+ '}
                                  {food.length > 40 ? `${food.slice(0, 40)}…` : food}
                                  {isAdded && <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.85 }}>(Added)</span>}
                                </button>
                              );
                            })}

                            {/* User Custom Food Chips */}
                            {customItems.map((food, cIdx) => {
                              const isAdded = isFoodItemAdded(meal.items, food);
                              return (
                                <div
                                  key={`cust_${cIdx}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    background: isAdded ? '#dcfce7' : '#f5f3ff',
                                    border: isAdded ? '1px solid #86efac' : '1px solid #c4b5fd',
                                    borderRadius: '6px',
                                    padding: '0 4px 0 0',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleToggleMealItem(meal.id, food)}
                                    title={isAdded ? `✓ Already added — click to remove` : `Click to add "${food}"`}
                                    style={{
                                      border: 'none',
                                      background: 'transparent',
                                      fontSize: '11px',
                                      padding: '4px 8px',
                                      color: isAdded ? '#15803d' : '#6d28d9',
                                      fontWeight: isAdded ? 700 : 600,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {isAdded ? '✓ ' : '★+ '}
                                    {food.length > 35 ? `${food.slice(0, 35)}…` : food}
                                    {isAdded && <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.85 }}>(Added)</span>}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCustomFoodItem(meal.name, food);
                                    }}
                                    title="Delete custom food option"
                                    style={{
                                      border: 'none',
                                      background: 'transparent',
                                      color: '#94a3b8',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      padding: '2px 4px',
                                      lineHeight: 1
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Portion / Serving Size */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Portion / Serving Size</label>
                        {activeAddingPortionMealId !== meal.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddingPortionMealId(meal.id);
                              setTempPortionText('');
                            }}
                            style={{
                              fontSize: '10.5px',
                              padding: '2px 8px',
                              background: '#f1f5f9',
                              color: '#0369a1',
                              border: '1px dashed #cbd5e1',
                              borderRadius: '6px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            + Custom Portion
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={meal.serving || ''}
                        onChange={(e) => handleUpdateMeal(meal.id, 'serving', e.target.value)}
                        placeholder="e.g. 1 glass / 500 mL, 2 medium, 1 bowl"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />

                      {/* Inline Custom Portion Input */}
                      {activeAddingPortionMealId === meal.id && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '6px',
                          padding: '6px 10px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px'
                        }}>
                          <input
                            type="text"
                            value={tempPortionText}
                            onChange={(e) => setTempPortionText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomPortion(meal.id, tempPortionText);
                              }
                            }}
                            placeholder="e.g. 150 mL / 3 scoops / 2 pieces..."
                            autoFocus
                            style={{ flex: 1, padding: '5px 8px', borderRadius: '4px', border: '1px solid #94a3b8', fontSize: '12px' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomPortion(meal.id, tempPortionText)}
                            style={{ padding: '5px 10px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddingPortionMealId(null);
                              setTempPortionText('');
                            }}
                            style={{ padding: '5px 8px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Portion Quick Chips (Default + Custom) */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {[...(QUICK_ADD_OPTIONS.portionSizes?.slice(0, 8) || []), ...customPortions].map((psz, pIdx) => {
                          const isSelected = (meal.serving || '').trim().toLowerCase() === psz.trim().toLowerCase();
                          return (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => handleToggleMealServing(meal.id, psz)}
                              className="diet-chip"
                              title={isSelected ? `✓ Selected — click to deselect "${psz}"` : `Click to set portion size to "${psz}"`}
                              style={{
                                fontSize: '10.5px',
                                padding: '3px 9px',
                                background: isSelected ? '#dcfce7' : '#f8fafc',
                                borderColor: isSelected ? '#86efac' : '#e2e8f0',
                                color: isSelected ? '#15803d' : '#475569',
                                fontWeight: isSelected ? 700 : 500,
                                boxShadow: isSelected ? '0 1px 2px rgba(22, 101, 52, 0.12)' : 'none'
                              }}
                            >
                              {isSelected ? `✓ ${psz}` : psz}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Special Dietary Note / Caution - Stacked one by one */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Special Dietary Note / Caution</label>
                          <span style={{ fontSize: '11px', color: '#854d0e', fontWeight: 600 }}>⚡ Click chips below to add points one by one</span>
                        </div>
                        {activeAddingNoteMealId !== meal.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddingNoteMealId(meal.id);
                              setTempNoteText('');
                            }}
                            style={{
                              fontSize: '10.5px',
                              padding: '2px 8px',
                              background: '#fef9c3',
                              color: '#854d0e',
                              border: '1px dashed #ca8a04',
                              borderRadius: '6px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            + Add Custom Note
                          </button>
                        )}
                      </div>

                      <textarea
                        rows={getDynamicRows(meal.note || '', 2)}
                        value={meal.note || ''}
                        onChange={(e) => handleUpdateMeal(meal.id, 'note', e.target.value)}
                        placeholder="Clinical cautions or notes (each point will appear one by one on a separate line)..."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          lineHeight: '1.6',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />

                      {/* Inline Custom Note Input */}
                      {activeAddingNoteMealId === meal.id && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '6px',
                          padding: '6px 10px',
                          background: '#fefce8',
                          border: '1px solid #fef08a',
                          borderRadius: '6px'
                        }}>
                          <input
                            type="text"
                            value={tempNoteText}
                            onChange={(e) => setTempNoteText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomNote(meal.id, tempNoteText);
                              }
                            }}
                            placeholder="Type custom note/caution (e.g. Avoid drinking water immediately after meal)..."
                            autoFocus
                            style={{ flex: 1, padding: '5px 8px', borderRadius: '4px', border: '1px solid #ca8a04', fontSize: '12px' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomNote(meal.id, tempNoteText)}
                            style={{ padding: '5px 10px', background: '#ca8a04', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Add Note
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddingNoteMealId(null);
                              setTempNoteText('');
                            }}
                            style={{ padding: '5px 8px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11.5px', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Notes Quick Chips (Default + Custom) */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {[...(QUICK_ADD_OPTIONS.specialNotes?.slice(0, 6) || []), ...customNotes].map((note, nIdx) => {
                          const isAdded = isMealNoteAdded(meal.note, note);
                          return (
                            <button
                              key={nIdx}
                              type="button"
                              onClick={() => handleToggleMealNote(meal.id, note)}
                              className="diet-chip"
                              title={isAdded ? `✓ Already added — click to remove` : `Click to add note point`}
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                background: isAdded ? '#dcfce7' : '#fefce8',
                                borderColor: isAdded ? '#86efac' : '#fef08a',
                                color: isAdded ? '#15803d' : '#854d0e',
                                fontWeight: isAdded ? 700 : 500,
                                boxShadow: isAdded ? '0 1px 2px rgba(22, 101, 52, 0.12)' : 'none'
                              }}
                            >
                              {isAdded ? '✓ ' : '+ '}
                              {note.length > 42 ? `${note.slice(0, 42)}…` : note}
                              {isAdded && <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.85 }}>(Added)</span>}
                            </button>
                          );
                        })}
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
                  {QUICK_ADD_OPTIONS.foodsToInclude.map(opt => {
                    const isAdded = isListOptionAdded('foodsToInclude', opt);
                    return (
                      <span
                        key={opt}
                        onClick={() => handleToggleListOption('foodsToInclude', opt)}
                        className="diet-chip"
                        title={isAdded ? `✓ Already added — click to remove` : `Click to add`}
                        style={{
                          fontSize: '11px',
                          padding: '4px 9px',
                          background: isAdded ? '#dcfce7' : '#f0fdf4',
                          borderColor: isAdded ? '#22c55e' : '#bbf7d0',
                          color: isAdded ? '#15803d' : '#166534',
                          fontWeight: isAdded ? 700 : 500,
                          boxShadow: isAdded ? '0 1px 2px rgba(22, 101, 52, 0.12)' : 'none'
                        }}
                      >
                        {isAdded ? '✓ ' : '+ '}
                        {opt.slice(0, 32)}...
                        {isAdded && <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.85 }}>(Added)</span>}
                      </span>
                    );
                  })}
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
                  {QUICK_ADD_OPTIONS.foodsInModeration.map(opt => {
                    const isAdded = isListOptionAdded('foodsInModeration', opt);
                    return (
                      <span
                        key={opt}
                        onClick={() => handleToggleListOption('foodsInModeration', opt)}
                        className="diet-chip"
                        title={isAdded ? `✓ Already added — click to remove` : `Click to add`}
                        style={{
                          fontSize: '11px',
                          padding: '4px 9px',
                          background: isAdded ? '#dcfce7' : '#fef9c3',
                          borderColor: isAdded ? '#22c55e' : '#fde047',
                          color: isAdded ? '#15803d' : '#854d0e',
                          fontWeight: isAdded ? 700 : 500,
                          boxShadow: isAdded ? '0 1px 2px rgba(22, 101, 52, 0.12)' : 'none'
                        }}
                      >
                        {isAdded ? '✓ ' : '+ '}
                        {opt.slice(0, 30)}...
                        {isAdded && <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.85 }}>(Added)</span>}
                      </span>
                    );
                  })}
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
                  {QUICK_ADD_OPTIONS.foodsToAvoid.map(opt => {
                    const isAdded = isListOptionAdded('foodsToAvoid', opt);
                    return (
                      <span
                        key={opt}
                        onClick={() => handleToggleListOption('foodsToAvoid', opt)}
                        className="diet-chip"
                        title={isAdded ? `✓ Already added — click to remove` : `Click to add`}
                        style={{
                          fontSize: '11px',
                          padding: '4px 9px',
                          background: isAdded ? '#dcfce7' : '#fee2e2',
                          borderColor: isAdded ? '#22c55e' : '#fca5a5',
                          color: isAdded ? '#15803d' : '#991b1b',
                          fontWeight: isAdded ? 700 : 500,
                          boxShadow: isAdded ? '0 1px 2px rgba(22, 101, 52, 0.12)' : 'none'
                        }}
                      >
                        {isAdded ? '✓ ' : '+ '}
                        {opt.slice(0, 30)}...
                        {isAdded && <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.85 }}>(Added)</span>}
                      </span>
                    );
                  })}
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
                  {QUICK_ADD_OPTIONS.dietaryGuidelines.map(opt => {
                    const isAdded = isListOptionAdded('dietaryGuidelines', opt);
                    return (
                      <span
                        key={opt}
                        onClick={() => handleToggleListOption('dietaryGuidelines', opt)}
                        className="diet-chip"
                        title={isAdded ? `✓ Already added — click to remove` : `Click to add`}
                        style={{
                          fontSize: '11px',
                          padding: '4px 9px',
                          background: isAdded ? '#dcfce7' : '#e0f2fe',
                          borderColor: isAdded ? '#22c55e' : '#bae6fd',
                          color: isAdded ? '#15803d' : '#0369a1',
                          fontWeight: isAdded ? 700 : 500,
                          boxShadow: isAdded ? '0 1px 2px rgba(22, 101, 52, 0.12)' : 'none'
                        }}
                      >
                        {isAdded ? '✓ ' : '+ '}
                        {opt.slice(0, 32)}...
                        {isAdded && <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.85 }}>(Added)</span>}
                      </span>
                    );
                  })}
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

          {/* BOTTOM ACTION BAR */}
          <div
            className="no-print"
            style={{
              padding: '20px 24px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
                Done preparing the plan? Save draft or submit to finalize.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setIsViewMode(!isViewMode)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #0284c7',
                  background: 'white',
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
                Print / Preview
              </button>

              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={isSubmitting}
                style={{
                  padding: '10px 20px',
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
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#10b981',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {isSubmitting ? 'Saving...' : 'Submit Diet Chart'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: PRINT & FULL NUTRITION CHART VIEW (EXACT MATCH TO 3-PAGE PDF)     */}
      {/* ========================================================================= */}
      {isViewMode && (() => {
        const beforeBedIdx = chartData.meals.findIndex(
          m => m.name.toLowerCase().includes('bed') || m.name.toLowerCase().includes('sleep')
        );
        const splitIdx = beforeBedIdx !== -1 ? beforeBedIdx : (chartData.meals.length > 5 ? 5 : chartData.meals.length);
        const page1Meals = chartData.meals.slice(0, splitIdx);
        const page2Meals = chartData.meals.slice(splitIdx);

        const renderPageHeader = () => (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px', marginBottom: '16px' }}>
            <div>
              <img
                src="/images/Benva%20NEW.png"
                alt="Benva Healthcare"
                style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0c3b6d', letterSpacing: '0.5px' }}>
                {chartData.title.toUpperCase()}
              </div>
              <div
                className="print-sky-banner"
                style={{
                  marginTop: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#e0f2fe',
                  backgroundColor: '#e0f2fe',
                  boxShadow: 'inset 0 0 0 1000px #e0f2fe',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                  color: '#0369a1',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                <span style={{ whiteSpace: 'nowrap' }}>Patient: <strong>{patient.name}</strong></span>
                <span>|</span>
                <span style={{ whiteSpace: 'nowrap' }}>UHID: <strong>{formatPatientUhid(patient.uhid)}</strong></span>
                <span>|</span>
                <span style={{ whiteSpace: 'nowrap' }}>Age: <strong>{formatPatientAge(patient.age)}</strong></span>
              </div>
            </div>
          </div>
        );

        const renderPageFooter = (pageNum: number, totalPages: number = 3) => (
          <div style={{
            borderTop: '1px solid #cbd5e1',
            paddingTop: '8px',
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#64748b'
          }}>
            <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Confidential Patient Document</span>
            <span style={{ fontWeight: 700, letterSpacing: '0.5px', color: '#475569' }}>BENVA HEALTH CARE</span>
            <span>Page {pageNum} of {totalPages}</span>
          </div>
        );

        return (
          <div className="diet-print-view" style={{ maxWidth: '850px', margin: '0 auto' }}>

            {/* TOP PREVIEW TOOLBAR */}
            <div className="no-print" style={{
              background: '#0f172a',
              color: 'white',
              padding: '14px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div>
                <strong style={{ fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📄</span> Official Benva 3-Page Clinical PDF
                </strong>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Click <strong style={{ color: '#38bdf8' }}>Download PDF (Full Color)</strong> for instant colored export. For browser print, check <strong style={{ color: '#38bdf8' }}>Background graphics</strong> in More settings.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsViewMode(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    background: '#1e293b',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Editor
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0284c7',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF (Full Color)'}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#10b981',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Print / Save via Browser
                </button>
              </div>
            </div>

            {/* PRINTABLE CONTAINER (ATTACHED TO PDF GENERATOR) */}
            <div ref={pdfContentRef} className="diet-pages-printable">

              {/* ============================================================= */}
              {/* PAGE 1: MEAL SCHEDULE (EARLY MORNING TO DINNER)              */}
              {/* ============================================================= */}
              <div className="diet-page" style={{
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: '4px',
                padding: '24px 30px',
                minHeight: '1020px',
                maxHeight: '1080px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                margin: '0 auto',
                overflow: 'hidden'
              }}>
                <div>
                  {/* RED TOP ACCENT BAR */}
                  <div
                    className="print-red-bar"
                    style={{
                      height: '3.5px',
                      background: '#dc2626',
                      backgroundColor: '#dc2626',
                      boxShadow: 'inset 0 0 0 1000px #dc2626',
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                      width: '100%',
                      marginBottom: '14px'
                    }}
                  />

                  {/* BENVA LOGO */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <img
                      src="/images/Benva%20NEW.png"
                      alt="BENVA HEALTH CARE"
                      style={{ height: '50px', width: 'auto', objectFit: 'contain' }}
                    />
                  </div>

                  {/* BLUE TITLE BLOCK */}
                  <div
                    className="print-blue-title"
                    style={{
                      background: '#0c3b6d',
                      backgroundColor: '#0c3b6d',
                      boxShadow: 'inset 0 0 0 1000px #0c3b6d',
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                      color: 'white',
                      textAlign: 'center',
                      padding: '10px 16px',
                      borderRadius: '3px',
                      marginBottom: '12px'
                    }}
                  >
                    <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                      {chartData.title}
                    </h1>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#bae6fd', fontWeight: 500 }}>
                      {chartData.subtitle}
                    </p>
                  </div>

                  {/* 4-COLUMN PATIENT DETAILS TABLE */}
                  <div
                    className="print-table-header"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.55fr 0.75fr 1.1fr',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      backgroundColor: '#f8fafc',
                      boxShadow: 'inset 0 0 0 1000px #f8fafc',
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                      marginBottom: '14px'
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderRight: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>PATIENT NAME</div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{patient.name}</div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRight: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>UHID</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px', whiteSpace: 'nowrap', letterSpacing: '0.2px' }}>
                        {formatPatientUhid(patient.uhid)}
                      </div>
                    </div>
                    <div style={{ padding: '8px 12px', borderRight: '1px solid #cbd5e1' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>AGE</div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px', whiteSpace: 'nowrap' }}>{formatPatientAge(patient.age)}</div>
                    </div>
                    <div style={{ padding: '8px 12px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>DIETITIAN</div>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dietitianName}</div>
                    </div>
                  </div>

                  {/* DAILY MEAL SCHEDULE BANNER */}
                  <div
                    className="print-blue-banner"
                    style={{
                      background: '#0c4a7f',
                      backgroundColor: '#0c4a7f',
                      boxShadow: 'inset 0 0 0 1000px #0c4a7f',
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                      color: 'white',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      marginBottom: '10px'
                    }}
                  >
                    DAILY MEAL SCHEDULE
                  </div>

                  {/* MEAL ROWS FOR PAGE 1 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {page1Meals.map((meal) => (
                      <div
                        key={meal.id}
                        style={{
                          display: 'flex',
                          border: '1px solid #cbd5e1',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          className="print-blue-banner"
                          style={{
                            width: '160px',
                            background: '#0c4a7f',
                            backgroundColor: '#0c4a7f',
                            boxShadow: 'inset 0 0 0 1000px #0c4a7f',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact',
                            color: 'white',
                            padding: '10px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <span style={{ fontSize: '11px', color: '#bae6fd', fontWeight: 600 }}>{meal.time}</span>
                          <strong style={{ fontSize: '14px', marginTop: '2px' }}>{meal.name}</strong>
                        </div>

                        <div style={{ flex: 1, padding: '10px 14px', background: '#ffffff' }}>
                          {meal.items && meal.items.split('\n').filter(Boolean).map((line, lIdx) => (
                            <div key={lIdx} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
                              <span style={{ color: '#ef4444', fontSize: '11px', lineHeight: 1 }}>●</span>
                              <span style={{ fontSize: '12.5px', lineHeight: '1.5', color: '#1e293b' }}>
                                {line.replace(/^[•\-\*●\s]+/, '').trim()}
                              </span>
                            </div>
                          ))}

                          {meal.serving && (
                            <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#0284c7', fontStyle: 'italic', fontWeight: 600 }}>
                              Serving: {meal.serving}
                            </div>
                          )}

                          {meal.note && (
                            <div style={{ marginTop: '6px' }}>
                              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>Note:</div>
                              {meal.note.split('\n').filter(Boolean).map((nLine, nIdx) => (
                                <div key={nIdx} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px', paddingLeft: '8px' }}>
                                  <span style={{ color: '#0284c7', fontSize: '9px', lineHeight: 1 }}>■</span>
                                  <span style={{ fontSize: '11.5px', lineHeight: '1.4', color: '#334155' }}>
                                    {nLine.replace(/^[•\-\*■\s]+/, '').trim()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {renderPageFooter(1, 3)}
              </div>

              <div className="no-print" style={{ height: '24px' }} />

              {/* ============================================================= */}
              {/* PAGE 2: BEFORE BED MEAL + INCLUSIONS, MODERATION, AVOID       */}
              {/* ============================================================= */}
              <div className="diet-page diet-page-break" style={{
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: '4px',
                padding: '24px 30px',
                minHeight: '1020px',
                maxHeight: '1080px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                margin: '0 auto',
                overflow: 'hidden'
              }}>
                <div>
                  {renderPageHeader()}

                  {/* REMAINING MEAL SLOTS (e.g. Before Bed at 9:00 PM) */}
                  {page2Meals.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      {page2Meals.map((meal) => (
                        <div
                          key={meal.id}
                          style={{
                            display: 'flex',
                            border: '1px solid #cbd5e1',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            className="print-blue-banner"
                            style={{
                              width: '160px',
                              background: '#0c4a7f',
                              backgroundColor: '#0c4a7f',
                              boxShadow: 'inset 0 0 0 1000px #0c4a7f',
                              WebkitPrintColorAdjust: 'exact',
                              printColorAdjust: 'exact',
                              color: 'white',
                              padding: '10px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <span style={{ fontSize: '11px', color: '#bae6fd', fontWeight: 600 }}>{meal.time}</span>
                            <strong style={{ fontSize: '14px', marginTop: '2px' }}>{meal.name}</strong>
                          </div>

                          <div style={{ flex: 1, padding: '10px 14px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              {meal.items && meal.items.split('\n').filter(Boolean).map((line, lIdx) => (
                                <div key={lIdx} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
                                  <span style={{ color: '#ef4444', fontSize: '11px', lineHeight: 1 }}>●</span>
                                  <span style={{ fontSize: '12.5px', lineHeight: '1.5', color: '#1e293b' }}>
                                    {line.replace(/^[•\-\*●\s]+/, '').trim()}
                                  </span>
                                </div>
                              ))}

                              {meal.serving && (
                                <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#0284c7', fontStyle: 'italic', fontWeight: 600 }}>
                                  Serving: {meal.serving}
                                </div>
                              )}

                              {meal.note && (
                                <div style={{ marginTop: '4px', fontSize: '11.5px', color: '#475569' }}>
                                  <strong>Note:</strong> {meal.note}
                                </div>
                              )}
                            </div>

                            <div
                              className="print-blue-banner"
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: '#0c4a7f',
                                backgroundColor: '#0c4a7f',
                                boxShadow: 'inset 0 0 0 1000px #0c4a7f',
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginLeft: '12px'
                              }}
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* FOODS TO BE INCLUDED (GREEN) */}
                  <div style={{ marginBottom: '14px', border: '1px solid #86efac', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      className="print-green-banner"
                      style={{
                        background: '#eafaf1',
                        backgroundColor: '#eafaf1',
                        boxShadow: 'inset 0 0 0 1000px #eafaf1',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                        color: '#166534',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '0.4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #86efac'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>🍏</span> FOODS TO BE INCLUDED
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                      </div>
                    </div>
                    <div style={{ padding: '12px 16px', background: 'white' }}>
                      {chartData.foodsToInclude.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '5px' }}>
                          <span style={{ color: '#16a34a', fontSize: '9px', lineHeight: 1 }}>■</span>
                          <span style={{ fontSize: '12px', lineHeight: '1.5', color: '#1e293b' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FOODS TO BE CONSUMED IN MODERATION (AMBER) */}
                  <div style={{ marginBottom: '14px', border: '1px solid #fde047', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      className="print-amber-banner"
                      style={{
                        background: '#fef9c3',
                        backgroundColor: '#fef9c3',
                        boxShadow: 'inset 0 0 0 1000px #fef9c3',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                        color: '#854d0e',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '0.4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottom: '1px solid #fde047'
                      }}
                    >
                      <span>🟡</span> FOODS TO BE CONSUMED IN MODERATION
                    </div>
                    <div style={{ padding: '12px 16px', background: 'white' }}>
                      {chartData.foodsInModeration.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '5px' }}>
                          <span style={{ color: '#ca8a04', fontSize: '9px', lineHeight: 1 }}>■</span>
                          <span style={{ fontSize: '12px', lineHeight: '1.5', color: '#1e293b' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FOODS TO BE AVOIDED (RED) */}
                  <div style={{ marginBottom: '10px', border: '1px solid #fca5a5', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      className="print-avoid-banner"
                      style={{
                        background: '#fee2e2',
                        backgroundColor: '#fee2e2',
                        boxShadow: 'inset 0 0 0 1000px #fee2e2',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                        color: '#991b1b',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '0.4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottom: '1px solid #fca5a5'
                      }}
                    >
                      <span>🚫</span> FOODS TO BE AVOIDED
                    </div>
                    <div style={{ padding: '12px 16px', background: 'white' }}>
                      {chartData.foodsToAvoid.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '5px' }}>
                          <span style={{ color: '#dc2626', fontSize: '9px', lineHeight: 1 }}>■</span>
                          <span style={{ fontSize: '12px', lineHeight: '1.5', color: '#1e293b' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {renderPageFooter(2, 3)}
              </div>

              <div className="no-print" style={{ height: '24px' }} />

              {/* ============================================================= */}
              {/* PAGE 3: GUIDELINES, FOLLOW-UP & SIGNATURE                    */}
              {/* ============================================================= */}
              <div className="diet-page diet-page-break" style={{
                background: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: '4px',
                padding: '24px 30px',
                minHeight: '1020px',
                maxHeight: '1080px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                margin: '0 auto',
                overflow: 'hidden'
              }}>
                <div>
                  {renderPageHeader()}

                  {/* DIETARY GUIDELINES BANNER */}
                  <div style={{ marginBottom: '18px', border: '1px solid #bae6fd', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      className="print-sky-banner"
                      style={{
                        background: '#e0f2fe',
                        backgroundColor: '#e0f2fe',
                        boxShadow: 'inset 0 0 0 1000px #e0f2fe',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                        color: '#0369a1',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '0.4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottom: '1px solid #bae6fd'
                      }}
                    >
                      <span>ℹ️</span> DIETARY GUIDELINES
                    </div>
                    <div style={{ padding: '14px 18px', background: 'white', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {chartData.dietaryGuidelines.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            className="print-sky-pill"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: '#0284c7',
                              backgroundColor: '#0284c7',
                              boxShadow: 'inset 0 0 0 1000px #0284c7',
                              WebkitPrintColorAdjust: 'exact',
                              printColorAdjust: 'exact',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {renderGuidelineIcon(item)}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#1e293b', lineHeight: '1.5' }}>
                            {item}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FOLLOW UP */}
                  <div
                    className="print-followup-box"
                    style={{
                      background: '#f0f9ff',
                      backgroundColor: '#f0f9ff',
                      boxShadow: 'inset 0 0 0 1000px #f0f9ff',
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                      border: '1px solid #bae6fd',
                      borderRadius: '3px',
                      padding: '12px 16px',
                      marginBottom: '36px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      FOLLOW-UP
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#1e293b', lineHeight: '1.5', paddingLeft: '23px' }}>
                      {chartData.followUp || 'Regular follow-up for at least 3 months to monitor blood glucose levels and assess progress.'}
                    </div>
                  </div>

                  {/* SIGNATURE BLOCK */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{dietitianName}</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>Consulting Dietitian, BENVA Health Care</div>
                    </div>
                  </div>
                </div>

                {renderPageFooter(3, 3)}
              </div>

            </div>

          </div>
        );
      })()}

    </div>
  );
}

