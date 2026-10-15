'use client';

import React, { useState } from 'react';
import MedicineRevenueStatementModal, { MedicineOrderTransaction, MedicineRevenueSummary } from './MedicineRevenueStatementModal';

export default function MedicinesClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<'all' | 'this_month' | 'last_month' | 'last_30_days'>('all');
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [editingConsignmentOrder, setEditingConsignmentOrder] = useState<any | null>(null);
  const [consignmentForm, setConsignmentForm] = useState({ consignmentNo: '', consignmentImage: '' });
  const [isUploadingConsignmentSlip, setIsUploadingConsignmentSlip] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    patientName: '',
    mobile: '',
    address: '',
    prescriptionUrls: [] as string[],
    medicines: [] as any[],
    totalMrp: '' as string | number,
    discount: '' as string | number,
    finalAmount: '' as string | number,
    lastGivenDate: '',
    nextDueDate: '',
    notes: '',
    status: 'ACTIVE',
    uhid: '',
    consignmentNo: '',
    consignmentImage: ''
  });

  // Mobile-first patient lookup states
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [foundFamilyMembers, setFoundFamilyMembers] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isNewMemberMode, setIsNewMemberMode] = useState(false);
  const [isPatientConfirmed, setIsPatientConfirmed] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const resetForm = () => {
    setFormData({
      patientName: '', mobile: '', address: '',
      prescriptionUrls: [], medicines: [],
      totalMrp: '', discount: '', finalAmount: '',
      lastGivenDate: '', nextDueDate: '', notes: '', status: 'ACTIVE',
      uhid: '', consignmentNo: '', consignmentImage: ''
    });
    setUploadSuccessMessage(null);
    setEditingOrder(null);
    setIsSearchingPhone(false);
    setFoundFamilyMembers([]);
    setHasSearched(false);
    setIsNewMemberMode(false);
    setIsPatientConfirmed(false);
    setSelectedMember(null);
  };

  const handlePhoneLookup = async (rawPhone: string) => {
    const clean = rawPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      setFoundFamilyMembers([]);
      setHasSearched(false);
      return;
    }
    setIsSearchingPhone(true);
    try {
      const res = await fetch(`/api/patients/by-phone?phone=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        setFoundFamilyMembers(Array.isArray(data) ? data : []);
      } else {
        setFoundFamilyMembers([]);
      }
    } catch (err) {
      console.error('Failed to lookup phone:', err);
      setFoundFamilyMembers([]);
    } finally {
      setIsSearchingPhone(false);
      setHasSearched(true);
    }
  };

  const handlePhoneInputChange = (val: string) => {
    setFormData(prev => ({ ...prev, mobile: val }));
    setIsPatientConfirmed(false);
    setSelectedMember(null);
    const clean = val.replace(/\D/g, '');
    if (clean.length >= 10) {
      handlePhoneLookup(clean);
    } else {
      setFoundFamilyMembers([]);
      setHasSearched(false);
      setIsNewMemberMode(false);
    }
  };

  const handleSelectFamilyMember = (member: any) => {
    setSelectedMember(member);
    setIsNewMemberMode(false);
    setIsPatientConfirmed(true);
    setFormData(prev => ({
      ...prev,
      patientName: member.name,
      mobile: prev.mobile || member.phone,
      uhid: member.uhid || '',
      address: member.address || prev.address,
    }));
  };

  const handleStartNewMember = () => {
    setIsNewMemberMode(true);
    setSelectedMember(null);
    setFormData(prev => ({
      ...prev,
      patientName: '',
      uhid: '',
    }));
  };

  const handleConfirmNewMember = () => {
    if (!formData.patientName.trim()) {
      alert('Please enter patient name');
      return;
    }
    setIsPatientConfirmed(true);
  };

  const handleMrpChange = (val: string) => {
    const mrp = parseFloat(val) || 0;
    const disc = parseFloat(String(formData.discount)) || 0;
    const finalVal = Math.max(0, mrp - disc);
    setFormData(prev => ({
      ...prev,
      totalMrp: val,
      finalAmount: finalVal === 0 && !val ? '' : finalVal
    }));
  };

  const handleDiscountChange = (val: string) => {
    const disc = parseFloat(val) || 0;
    const mrp = parseFloat(String(formData.totalMrp)) || 0;
    const finalVal = Math.max(0, mrp - disc);
    setFormData(prev => ({
      ...prev,
      discount: val,
      finalAmount: finalVal === 0 && !mrp ? '' : finalVal
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          const formDataUpload = new FormData();
          formDataUpload.append('file', file);
          const res = await fetch('/api/upload-direct', {
            method: 'POST',
            body: formDataUpload
          });
          
          if (res.ok) {
            const data = await res.json();
            const uploadedUrl = data.url || data.fileUrl;
            if (uploadedUrl) {
              newUrls.push(uploadedUrl);
              continue;
            }
          }
        } catch (serverErr) {
          console.warn('Server upload failed for file, using base64 preview:', serverErr);
        }

        // Fallback: Read as base64 data URL so the uploaded preview always displays
        const base64Url = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve((ev.target?.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });

        if (base64Url) {
          newUrls.push(base64Url);
        }
      }

      if (newUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          prescriptionUrls: [...(Array.isArray(prev.prescriptionUrls) ? prev.prescriptionUrls : []), ...newUrls]
        }));
        const countText = newUrls.length === 1 ? '1 image' : `${newUrls.length} images`;
        setUploadSuccessMessage(`✓ Uploaded successfully (${countText})`);
        setTimeout(() => {
          setUploadSuccessMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { id: Date.now().toString(), name: '', type: 'Tablet', quantity: '', instructions: '', isSelected: true }]
    }));
  };

  const handleMedicineChange = (index: number, field: string, value: any) => {
    const newMeds = [...formData.medicines];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setFormData({ ...formData, medicines: newMeds });
  };

  const handleRemoveMedicine = (index: number) => {
    const newMeds = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: newMeds });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingOrder ? `/api/admin/medicines/${editingOrder.id}` : '/api/admin/medicines';
      const method = editingOrder ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      const saved = await res.json();
      if (editingOrder) {
        setOrders(orders.map(o => o.id === saved.id ? saved : o));
      } else {
        setOrders([saved, ...orders]);
      }
      
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Error saving order');
    }
  };

  const handleSelectPreset = (preset: 'all' | 'this_month' | 'last_month' | 'last_30_days') => {
    setSelectedPreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setFromDate('');
      setToDate('');
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setFromDate(firstDay.toISOString().split('T')[0]);
      setToDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'last_30_days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setFromDate(past.toISOString().split('T')[0]);
      setToDate(now.toISOString().split('T')[0]);
    }
  };

  const getDateRangeLabel = () => {
    if (selectedPreset === 'this_month') return 'This Month';
    if (selectedPreset === 'last_month') return 'Last Month';
    if (selectedPreset === 'last_30_days') return 'Last 30 Days';
    if (fromDate || toDate) return 'Custom Date Range';
    return 'All Time';
  };

  const handleOpenConsignmentModal = (order: any) => {
    setEditingConsignmentOrder(order);
    setConsignmentForm({
      consignmentNo: order.consignmentNo || '',
      consignmentImage: order.consignmentImage || ''
    });
  };

  const handleUploadConsignmentSlip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingConsignmentSlip(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const res = await fetch('/api/upload-direct', {
        method: 'POST',
        body: uploadFormData
      });
      if (res.ok) {
        const data = await res.json();
        const url = data.url || data.fileUrl;
        if (url) {
          setConsignmentForm(prev => ({ ...prev, consignmentImage: url }));
        }
      } else {
        alert('Failed to upload consignment image');
      }
    } catch (err) {
      console.error('Error uploading consignment slip:', err);
      alert('Upload failed');
    } finally {
      setIsUploadingConsignmentSlip(false);
      e.target.value = '';
    }
  };

  const handleSaveConsignment = async () => {
    if (!editingConsignmentOrder) return;
    try {
      const res = await fetch(`/api/admin/medicines/${editingConsignmentOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consignmentNo: consignmentForm.consignmentNo,
          consignmentImage: consignmentForm.consignmentImage
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, consignmentNo: updated.consignmentNo, consignmentImage: updated.consignmentImage } : o));
        setEditingConsignmentOrder(null);
      } else {
        alert('Failed to save consignment info');
      }
    } catch (err) {
      console.error('Save consignment error:', err);
      alert('Error updating consignment');
    }
  };

  const handleDelete = async (id: string, name?: string) => {
    if (!confirm(`Are you sure you want to delete medicine order for ${name || 'this patient'}?\nThis action cannot be undone.`)) {
      return;
    }
    setDeletingOrderId(id);
    try {
      const res = await fetch(`/api/admin/medicines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
      } else {
        alert('Failed to delete order from server');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting order');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    let urls: string[] = [];
    if (Array.isArray(order.prescriptionUrls)) {
      urls = order.prescriptionUrls;
    } else if (typeof order.prescriptionUrls === 'string') {
      try {
        const parsed = JSON.parse(order.prescriptionUrls);
        if (Array.isArray(parsed)) urls = parsed;
        else if (parsed) urls = [parsed];
      } catch {
        if (order.prescriptionUrls.startsWith('http') || order.prescriptionUrls.startsWith('/')) {
          urls = [order.prescriptionUrls];
        }
      }
    }
    setFormData({
      patientName: order.patientName || '',
      mobile: order.mobile || '',
      address: order.address || '',
      prescriptionUrls: urls,
      medicines: order.medicines || [],
      totalMrp: order.totalMrp ?? '',
      discount: order.discount ?? '',
      finalAmount: order.finalAmount ?? '',
      lastGivenDate: order.lastGivenDate ? new Date(order.lastGivenDate).toISOString().split('T')[0] : '',
      nextDueDate: order.nextDueDate ? new Date(order.nextDueDate).toISOString().split('T')[0] : '',
      notes: order.notes || '',
      status: order.status || 'ACTIVE',
      uhid: order.uhid || '',
      consignmentNo: order.consignmentNo || '',
      consignmentImage: order.consignmentImage || ''
    });
    setIsPatientConfirmed(true);
    setIsAddModalOpen(true);
  };

  const generatePDF = async (order: any, action: 'view' | 'download' = 'view', type: 'internal' | 'pharmacy' = 'internal') => {
    const pdfKey = `${order.id}-${type}-${action}`;
    try {
      setGeneratingPdfId(pdfKey);
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageWidth = 210;
      const margin = 14;
      const contentWidth = pageWidth - margin * 2; // 182mm
      const isPharmacy = type === 'pharmacy';

      // Helper: Load image to Data URL
      const loadImageDataUrl = (src: string): Promise<string | null> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || img.width || 300;
              canvas.height = img.naturalHeight || img.height || 100;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
              } else {
                resolve(null);
              }
            } catch (e) {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = src;
        });
      };

      // Professional Color Palette
      const brandPrimary = isPharmacy ? [2, 132, 199] : [15, 49, 98]; // Sky blue for pharmacy, Deep Navy for Office
      const brandDark = [15, 23, 42]; // Slate 900
      const brandMuted = [100, 116, 139]; // Slate 500
      const brandLight = [248, 250, 252]; // Slate 50
      const brandBorder = [226, 232, 240]; // Slate 200

      // 1. Top Decorative Brand Bar (Clean 6mm header stripe)
      doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
      doc.rect(0, 0, pageWidth, 5, 'F');

      // 2. Header Section
      const logoDataUrl = await loadImageDataUrl('/images/benva-logo-new.png');
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', margin, 10, 46, 16);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text('Benva', margin, 20);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('HEALTHCARE', margin + 22, 20);
      }

      // Tagline under logo
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
      doc.text('Healthcare At Your Doorstep  |  www.benva.in  |  support@benva.in', margin, 30);

      // Top-Right Document Type Badge
      const badgeW = isPharmacy ? 76 : 72;
      const badgeH = 17;
      const badgeX = pageWidth - margin - badgeW;
      const badgeY = 9.5;

      doc.setFillColor(isPharmacy ? 240 : 241, isPharmacy ? 249 : 245, isPharmacy ? 255 : 249);
      doc.setDrawColor(isPharmacy ? 186 : 203, isPharmacy ? 230 : 213, isPharmacy ? 253 : 225);
      doc.setLineWidth(0.4);
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
      doc.text(isPharmacy ? 'PHARMACY DISPATCH SLIP' : 'OFFICE / INTERNAL COPY', badgeX + badgeW / 2, badgeY + 7, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(isPharmacy ? 3 : 71, isPharmacy ? 105 : 85, isPharmacy ? 161 : 105);
      doc.text(isPharmacy ? 'CONFIDENTIAL PARTNER DISPENSING' : 'ADMINISTRATIVE RECORD (FULL)', badgeX + badgeW / 2, badgeY + 13, { align: 'center' });

      // Clean separator rule
      doc.setDrawColor(brandBorder[0], brandBorder[1], brandBorder[2]);
      doc.setLineWidth(0.5);
      doc.line(margin, 34, pageWidth - margin, 34);

      // 3. Section 1: Patient / Order Particulars Card
      let y = 39;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
      doc.text(isPharmacy ? 'DISPATCH SPECIFICATIONS' : 'PATIENT & ORDER PARTICULARS', margin, y);

      y += 4;
      const cardHeight = isPharmacy ? 26 : 38;

      // Outer Rounded Box
      doc.setFillColor(brandLight[0], brandLight[1], brandLight[2]);
      doc.setDrawColor(brandBorder[0], brandBorder[1], brandBorder[2]);
      doc.setLineWidth(0.35);
      doc.roundedRect(margin, y, contentWidth, cardHeight, 2.5, 2.5, 'FD');

      // Left Accent Strip
      doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
      doc.roundedRect(margin, y, 2.5, cardHeight, 1, 1, 'F');

      if (isPharmacy) {
        // Left Column (Patient Name & Order ID)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
        doc.text(order.patientName || 'Patient Order', margin + 8, y + 8.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text(order.uhid ? 'Patient UHID:' : 'Order Ref ID:', margin + 8, y + 15.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
        doc.text(order.uhid || ('#' + (order.id ? order.id.slice(-8).toUpperCase() : 'N/A')), margin + 34, y + 15.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('Fulfillment:', margin + 8, y + 21.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text('Partner Pharmacy Direct Dispensing', margin + 34, y + 21.5);

        // Right Column (Dates & Confidentiality Note)
        const col2X = margin + 105;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('Order Date:', col2X, y + 8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
        doc.text(order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'), col2X + 26, y + 8.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('Dispense By:', col2X, y + 15.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
        doc.text(order.lastGivenDate ? new Date(order.lastGivenDate).toLocaleDateString('en-GB') : 'Immediate', col2X + 26, y + 15.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('Privacy Status:', col2X, y + 21.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 101, 52);
        doc.text('Patient Phone & Address Protected', col2X + 26, y + 21.5);
      } else {
        // OFFICE COPY: Full Details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
        const pTitle = order.patientName ? (order.uhid ? `${order.patientName} (${order.uhid})` : order.patientName) : 'Patient Order';
        doc.text(pTitle, margin + 8, y + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('Mobile Phone:', margin + 8, y + 15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
        doc.text(order.mobile || '-', margin + 34, y + 15);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('Delivery Address:', margin + 8, y + 22);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const addressLines = doc.splitTextToSize(order.address || 'Not specified', 65);
        doc.text(addressLines, margin + 34, y + 22);

        // Right Column
        const col2X = margin + 105;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('Order Date:', col2X, y + 8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
        doc.text(order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'), col2X + 26, y + 8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('Last Given:', col2X, y + 15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
        doc.text(order.lastGivenDate ? new Date(order.lastGivenDate).toLocaleDateString('en-GB') : '-', col2X + 26, y + 15);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('Next Due:', col2X, y + 22);
        if (order.nextDueDate) {
          doc.setTextColor(220, 38, 38);
          doc.setFont('helvetica', 'bold');
          doc.text(new Date(order.nextDueDate).toLocaleDateString('en-GB'), col2X + 26, y + 22);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
          doc.text('-', col2X + 26, y + 22);
        }

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('Order Status:', col2X, y + 29);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(order.status === 'ACTIVE' ? 22 : 71, order.status === 'ACTIVE' ? 101 : 85, order.status === 'ACTIVE' ? 52 : 105);
        doc.text(order.status || 'ACTIVE', col2X + 26, y + 29);
      }

      // 4. Section 2: Medicines Required Table
      y += cardHeight + 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
      doc.text(isPharmacy ? 'MEDICINES REQUIRED FROM PHARMACY' : 'PRESCRIBED MEDICINES (ORDER DETAILS)', margin, y);

      y += 4;
      const tableHeadH = 8.5;
      doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
      doc.rect(margin, y, contentWidth, tableHeadH, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('#', margin + 4, y + 5.8);
      doc.text('Medicine Name / Formulation', margin + 14, y + 5.8);
      doc.text('Type', margin + 85, y + 5.8);
      doc.text('Qty', margin + 115, y + 5.8);
      doc.text('Dosage / Instructions', margin + 140, y + 5.8);

      y += tableHeadH;
      let meds: any[] = [];
      try {
        if (typeof order.medicines === 'string') meds = JSON.parse(order.medicines);
        else if (Array.isArray(order.medicines)) meds = order.medicines;
      } catch (e) {}

      meds = meds.filter((m: any) => m.isSelected !== false);

      if (meds.length === 0) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(brandBorder[0], brandBorder[1], brandBorder[2]);
        doc.rect(margin, y, contentWidth, 11, 'FD');
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text('No medicines listed textually. Please refer to attached customer strip & prescription photos on next page(s).', margin + 6, y + 7.5);
        y += 11;
      } else {
        meds.forEach((m, idx) => {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          const isEven = idx % 2 === 0;
          const rowH = 9;
          doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
          doc.setDrawColor(brandBorder[0], brandBorder[1], brandBorder[2]);
          doc.rect(margin, y, contentWidth, rowH, 'FD');

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
          doc.text(String(idx + 1), margin + 4, y + 6);

          doc.setFont('helvetica', 'bold');
          doc.text(String(m.name || '-').slice(0, 36), margin + 14, y + 6);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(String(m.type || '-').slice(0, 15), margin + 85, y + 6);
          doc.text(String(m.quantity || '-').slice(0, 15), margin + 115, y + 6);
          doc.text(String(m.instructions || '-').slice(0, 26), margin + 140, y + 6);

          y += rowH;
        });
      }

      // 5. Section 3: Office Billing Card (Only on Office Copy)
      if (!isPharmacy && (Number(order.totalMrp) > 0 || Number(order.discount) > 0 || Number(order.finalAmount) > 0)) {
        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text('BILLING & FINANCIAL SUMMARY', margin, y);

        y += 4;
        const billBoxH = 17;
        doc.setFillColor(brandLight[0], brandLight[1], brandLight[2]);
        doc.setDrawColor(brandBorder[0], brandBorder[1], brandBorder[2]);
        doc.setLineWidth(0.35);
        doc.roundedRect(margin, y, contentWidth, billBoxH, 2.5, 2.5, 'FD');

        const colW = contentWidth / 3;

        // Total MRP
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('TOTAL MRP (CATALOG)', margin + 10, y + 6);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
        doc.text(`Rs. ${Number(order.totalMrp || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + 10, y + 13);

        // Divider 1
        doc.setDrawColor(brandBorder[0], brandBorder[1], brandBorder[2]);
        doc.line(margin + colW, y + 2.5, margin + colW, y + billBoxH - 2.5);

        // Discount
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('DISCOUNT SAVINGS', margin + colW + 10, y + 6);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(22, 101, 52);
        doc.text(`- Rs. ${Number(order.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + colW + 10, y + 13);

        // Divider 2
        doc.line(margin + colW * 2, y + 2.5, margin + colW * 2, y + billBoxH - 2.5);

        // Net Amount
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
        doc.text('NET AMOUNT PAID', margin + colW * 2 + 10, y + 6);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text(`Rs. ${Number(order.finalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + colW * 2 + 10, y + 13);

        y += billBoxH + 4;
      }

      // 6. Section 3: Pharmacy Instructions (Only on Pharmacy Slip)
      if (isPharmacy) {
        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text('PHARMACY DISPENSING GUIDELINES & PROTOCOL', margin, y);

        y += 4;
        const noteBoxH = 17;
        doc.setFillColor(240, 249, 255);
        doc.setDrawColor(186, 230, 253);
        doc.setLineWidth(0.4);
        doc.roundedRect(margin, y, contentWidth, noteBoxH, 2.5, 2.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
        doc.text('Quality & Security Verification Checklist:', margin + 8, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(51, 65, 85);
        doc.text('1. Verify medicine batch number, seal integrity, and check minimum 6 months expiry prior to packaging.', margin + 8, y + 10.5);
        doc.text('2. Match tablet formulations against the customer WhatsApp strip photos attached on the next page(s).', margin + 8, y + 14.5);

        y += noteBoxH + 4;
      }

      // 7. Clean Bottom Footer
      doc.setDrawColor(brandBorder[0], brandBorder[1], brandBorder[2]);
      doc.setLineWidth(0.4);
      doc.line(margin, 280, pageWidth - margin, 280);

      doc.setTextColor(brandMuted[0], brandMuted[1], brandMuted[2]);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        isPharmacy 
          ? 'Benva Healthcare Partner Dispatch  |  Strictly for pharmacy dispensing  |  Patient contact details protected' 
          : 'Benva Healthcare Official Record  |  Administrative Office Copy  |  Healthcare at your doorstep', 
        pageWidth / 2, 
        286, 
        { align: 'center' }
      );

      // Attached Prescriptions & Medicine Strip Photos on subsequent pages
      let pUrls: string[] = [];
      if (Array.isArray(order.prescriptionUrls)) {
        pUrls = order.prescriptionUrls;
      } else if (typeof order.prescriptionUrls === 'string') {
        try {
          const parsed = JSON.parse(order.prescriptionUrls);
          if (Array.isArray(parsed)) pUrls = parsed;
          else if (parsed) pUrls = [parsed];
        } catch {
          if (order.prescriptionUrls.startsWith('http') || order.prescriptionUrls.startsWith('/') || order.prescriptionUrls.startsWith('data:')) {
            pUrls = [order.prescriptionUrls];
          }
        }
      }

      if (pUrls.length > 0) {
        for (let i = 0; i < pUrls.length; i++) {
          const url = pUrls[i];
          try {
            doc.addPage();
            // Accent bar on attachment page
            doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
            doc.rect(0, 0, pageWidth, 5, 'F');

            // Header Banner
            doc.setFillColor(brandPrimary[0], brandPrimary[1], brandPrimary[2]);
            doc.roundedRect(margin, 10, contentWidth, 12, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9.5);
            doc.setFont('helvetica', 'bold');
            doc.text(`Prescription / Medicine Strip Photo (${i + 1} of ${pUrls.length})`, margin + 6, 17.5);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Patient: ${order.patientName || 'Patient'}`, pageWidth - margin - 6, 17.5, { align: 'right' });

            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
              const image = new Image();
              image.crossOrigin = 'anonymous';
              image.onload = () => resolve(image);
              image.onerror = (e) => reject(e);
              image.src = url;
            });

            const maxW = contentWidth;
            const maxH = 245;
            const natW = img.naturalWidth || img.width || 800;
            const natH = img.naturalHeight || img.height || 600;
            const ratio = Math.min(maxW / natW, maxH / natH);
            const imgW = natW * ratio;
            const imgH = natH * ratio;
            const imgX = margin + (contentWidth - imgW) / 2;

            // Frame for image
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(imgX - 2, 25, imgW + 4, imgH + 4, 2, 2, 'FD');

            // Draw to canvas to guarantee safe JPEG dataURL conversion for jsPDF
            try {
              const canvas = document.createElement('canvas');
              canvas.width = natW;
              canvas.height = natH;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                doc.addImage(dataUrl, 'JPEG', imgX, 27, imgW, imgH);
              } else {
                doc.addImage(img, 'JPEG', imgX, 27, imgW, imgH);
              }
            } catch (cvsErr) {
              doc.addImage(img, 'JPEG', imgX, 27, imgW, imgH);
            }

            // Footer on attachment page
            doc.setTextColor(148, 163, 184);
            doc.setFontSize(7.5);
            doc.text('Benva Healthcare • Customer Attachment', pageWidth / 2, 287, { align: 'center' });
          } catch (imgErr) {
            console.warn('Could not render prescription image in PDF:', imgErr);
          }
        }
      }

      const prefix = isPharmacy ? 'Pharmacy_Dispatch_Slip' : 'Office_Internal_Copy';
      const cleanPatientName = (order.patientName || 'Patient').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${prefix}_${cleanPatientName}.pdf`;

      if (action === 'download') {
        doc.save(filename);
      } else {
        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          const a = document.createElement('a');
          a.href = blobUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPdfId(null);
    }
  };

  const exportHistoryCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export in the selected range.');
      return;
    }

    const headers = [
      'S.No',
      'Order Date',
      'Patient Name',
      'UHID',
      'Mobile',
      'Address',
      'Medicines Given',
      'Total MRP (INR)',
      'Discount Given (INR)',
      'Final Paid Amount (INR)',
      'Last Given Date',
      'Next Due Date',
      'Status'
    ];

    const rows = filteredOrders.map((o, idx) => {
      let medList: any[] = [];
      try {
        if (typeof o.medicines === 'string') medList = JSON.parse(o.medicines);
        else if (Array.isArray(o.medicines)) medList = o.medicines;
      } catch (e) {}

      const medsString = medList
        .filter((m: any) => m.isSelected !== false)
        .map((m: any) => `${m.name || 'Medicine'} (${m.type || 'Tab'}: ${m.quantity || '1'}${m.instructions ? ` - ${m.instructions}` : ''})`)
        .join(' ; ');

      const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : '-';
      const lastGiven = o.lastGivenDate ? new Date(o.lastGivenDate).toLocaleDateString('en-GB') : '-';
      const nextDue = o.nextDueDate ? new Date(o.nextDueDate).toLocaleDateString('en-GB') : '-';

      return [
        idx + 1,
        `"${orderDate}"`,
        `"${(o.patientName || '').replace(/"/g, '""')}"`,
        `"${(o.uhid || '').replace(/"/g, '""')}"`,
        `"${o.mobile || ''}"`,
        `"${(o.address || '').replace(/"/g, '""')}"`,
        `"${medsString.replace(/"/g, '""')}"`,
        Number(o.totalMrp || 0).toFixed(2),
        Number(o.discount || 0).toFixed(2),
        Number(o.finalAmount || 0).toFixed(2),
        `"${lastGiven}"`,
        `"${nextDue}"`,
        `"${o.status || 'ACTIVE'}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateRangeStr = fromDate || toDate ? `_${fromDate || 'start'}_to_${toDate || 'today'}` : '';
    a.download = `Benva_Medicine_Orders_History${dateRangeStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportHistoryPDF = async () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export in the selected range.');
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
      const pageWidth = 297;
      const margin = 14;
      const contentWidth = pageWidth - margin * 2; // 269mm

      // Header Bar
      doc.setFillColor(15, 49, 98);
      doc.rect(margin, 10, contentWidth, 18, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Benva Healthcare - Medicine Orders Statement', margin + 6, 19);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const periodText = fromDate || toDate 
        ? `Period: ${fromDate ? new Date(fromDate).toLocaleDateString('en-GB') : 'Start'} to ${toDate ? new Date(toDate).toLocaleDateString('en-GB') : 'Present'}`
        : 'All Time Orders Statement';
      doc.text(periodText, margin + 6, 24);

      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin - 6, 21, { align: 'right' });

      // Calculate totals
      const totalOrdersCount = filteredOrders.length;
      const totalMrpSum = filteredOrders.reduce((sum, o) => sum + (Number(o.totalMrp) || 0), 0);
      const totalDiscountSum = filteredOrders.reduce((sum, o) => sum + (Number(o.discount) || 0), 0);
      const totalFinalSum = filteredOrders.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);

      // KPI Summary cards
      let y = 32;
      const cardW = (contentWidth - 9) / 4;
      const cards = [
        { label: 'Total Orders', val: `${totalOrdersCount}`, color: [30, 41, 59] },
        { label: 'Total MRP', val: `Rs. ${totalMrpSum.toFixed(2)}`, color: [15, 49, 98] },
        { label: 'Total Discount', val: `Rs. ${totalDiscountSum.toFixed(2)}`, color: [22, 101, 52] },
        { label: 'Net Billed Amount', val: `Rs. ${totalFinalSum.toFixed(2)}`, color: [37, 99, 235] }
      ];

      cards.forEach((c, i) => {
        const cX = margin + i * (cardW + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(cX, y, cardW, 14, 1.5, 1.5, 'FD');

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(c.label, cX + 4, y + 4.5);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(c.color[0], c.color[1], c.color[2]);
        doc.text(c.val, cX + 4, y + 10.5);
      });

      // Table Header
      y = 51;
      doc.setFillColor(15, 49, 98);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');

      doc.text('#', margin + 2, y + 5);
      doc.text('Date', margin + 10, y + 5);
      doc.text('Patient Name', margin + 30, y + 5);
      doc.text('Mobile', margin + 70, y + 5);
      doc.text('Medicines Given', margin + 98, y + 5);
      doc.text('MRP (Rs.)', margin + 195, y + 5, { align: 'right' });
      doc.text('Disc (Rs.)', margin + 225, y + 5, { align: 'right' });
      doc.text('Final (Rs.)', margin + 258, y + 5, { align: 'right' });

      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      filteredOrders.forEach((order, idx) => {
        if (y > 185) {
          doc.addPage();
          y = 15;
          doc.setFillColor(15, 49, 98);
          doc.rect(margin, y, contentWidth, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text('#', margin + 2, y + 5);
          doc.text('Date', margin + 10, y + 5);
          doc.text('Patient Name', margin + 30, y + 5);
          doc.text('Mobile', margin + 70, y + 5);
          doc.text('Medicines Given', margin + 98, y + 5);
          doc.text('MRP (Rs.)', margin + 195, y + 5, { align: 'right' });
          doc.text('Disc (Rs.)', margin + 225, y + 5, { align: 'right' });
          doc.text('Final (Rs.)', margin + 258, y + 5, { align: 'right' });
          y += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
        }

        const isEven = idx % 2 === 0;
        doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, contentWidth, 7, 'FD');

        doc.setTextColor(15, 23, 42);
        doc.text(String(idx + 1), margin + 2, y + 4.8);
        const oDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : '-';
        doc.text(oDate, margin + 10, y + 4.8);
        doc.text(String(order.patientName || '-').slice(0, 20), margin + 30, y + 4.8);
        doc.text(String(order.mobile || '-'), margin + 70, y + 4.8);

        let meds: any[] = [];
        try {
          if (typeof order.medicines === 'string') meds = JSON.parse(order.medicines);
          else if (Array.isArray(order.medicines)) meds = order.medicines;
        } catch (e) {}
        const medsSummary = meds.map((m: any) => `${m.name || ''} (${m.quantity || ''})`).filter(Boolean).join(', ');
        doc.text(medsSummary.slice(0, 52) || '-', margin + 98, y + 4.8);

        doc.text(Number(order.totalMrp || 0).toFixed(2), margin + 195, y + 4.8, { align: 'right' });
        doc.setTextColor(22, 101, 52);
        doc.text(Number(order.discount || 0).toFixed(2), margin + 225, y + 4.8, { align: 'right' });
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(Number(order.finalAmount || 0).toFixed(2), margin + 258, y + 4.8, { align: 'right' });
        doc.setFont('helvetica', 'normal');

        y += 7;
      });

      const dateRangeStr = fromDate || toDate ? `_${fromDate || 'start'}_to_${toDate || 'today'}` : '';
      doc.save(`Benva_Medicine_Statement${dateRangeStr}.pdf`);
    } catch (err) {
      console.error('History PDF failed:', err);
      alert('Failed to generate summary PDF.');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.mobile.includes(searchTerm) ||
      (o.uhid && o.uhid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.consignmentNo && o.consignmentNo.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    const orderDate = new Date(o.createdAt || o.lastGivenDate || 0);
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (orderDate < from) return false;
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (orderDate > to) return false;
    }
    return true;
  });

  // Calculate Revenue Metrics (Paina vachey options / Overall Totals)
  const totalNetRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);
  const totalGrossMrp = filteredOrders.reduce((sum, o) => sum + (Number(o.totalMrp) || 0), 0);
  const totalDiscount = filteredOrders.reduce((sum, o) => sum + (Number(o.discount) || 0), 0);
  const totalOrdersCount = filteredOrders.length;
  const activeOrdersCount = filteredOrders.filter(o => o.status === 'ACTIVE').length;

  const revenueSummary: MedicineRevenueSummary = {
    totalGrossMrp,
    totalDiscount,
    totalNetRevenue,
    ordersCount: totalOrdersCount,
    activeCount: activeOrdersCount
  };

  const statementTransactions: MedicineOrderTransaction[] = filteredOrders.map((o, idx) => {
    let medList: any[] = [];
    try {
      if (typeof o.medicines === 'string') medList = JSON.parse(o.medicines);
      else if (Array.isArray(o.medicines)) medList = o.medicines;
    } catch (e) {}

    const medsString = medList
      .filter((m: any) => m.isSelected !== false)
      .map((m: any) => `${m.name || 'Medicine'} (${m.type || 'Tab'}: ${m.quantity || '1'})`)
      .join(', ');

    const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : (o.lastGivenDate ? new Date(o.lastGivenDate).toLocaleDateString('en-GB') : '-');

    return {
      sNo: idx + 1,
      date: dateStr,
      patientName: o.patientName || '',
      uhid: o.uhid || '',
      phone: o.mobile || '',
      consignmentNo: o.consignmentNo || '',
      consignmentImage: o.consignmentImage || '',
      medicinesList: medsString || '-',
      grossMrp: Number(o.totalMrp) || 0,
      discount: Number(o.discount) || 0,
      netRevenue: Number(o.finalAmount) || 0,
      status: o.status || 'ACTIVE'
    };
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1360px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header with Title & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f274a', margin: 0, letterSpacing: '-0.5px' }}>
            Medicine Orders & Benva Revenue
          </h1>
          <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '14px' }}>
            Track patient prescriptions, WhatsApp medicine strip scans, pharmacy dispatch fulfillment, and download bank statements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            onClick={() => setIsStatementModalOpen(true)}
            style={{ 
              background: '#047857', 
              color: 'white', 
              border: 'none', 
              padding: '11px 20px', 
              borderRadius: '10px', 
              fontWeight: 700, 
              fontSize: '14px',
              cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.15s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Download Bank Statement
          </button>

          <button 
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            style={{ 
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
              color: 'white', 
              border: 'none', 
              padding: '11px 22px', 
              borderRadius: '10px', 
              fontWeight: 700, 
              fontSize: '14px',
              cursor: 'pointer', 
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.15s ease'
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Add New Order
          </button>
        </div>
      </div>

      {/* Benva Revenue Summary Cards (Paina vachey options / Overall Totals) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* 1. Benva Net Revenue (Featured Card - Anni Ponu) */}
        <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: 'white', border: '1px solid #059669', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 4px 14px rgba(4, 120, 87, 0.25)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', opacity: 0.9 }}>
            ★ Benva Net Revenue (Anni Ponu)
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px' }}>
            ₹{totalNetRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px', fontWeight: 500 }}>
            Total net realized amount after all discounts
          </div>
        </div>

        {/* 2. Total Gross MRP Billed */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Gross MRP Billed
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f274a', marginTop: '4px' }}>
            ₹{totalGrossMrp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
            Medicine MRP catalog value before discounts
          </div>
        </div>

        {/* 3. Total Discounts Given */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Deductions / Discounts
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
            -₹{totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', fontWeight: 500 }}>
            Discounts deducted from MRP
          </div>
        </div>

        {/* 4. Total Orders & Fulfillment */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderLeft: '4px solid #0284c7', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Orders & Dispatch Fulfillment
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f274a', marginTop: '4px' }}>
            {totalOrdersCount} Orders
          </div>
          <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '4px', fontWeight: 600 }}>
            📦 {activeOrdersCount} Active pharmacy deliveries
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        {/* Date Filter & Export Toolbar */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {/* Quick Month Presets */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleSelectPreset('all')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #cbd5e1', background: selectedPreset === 'all' && !fromDate && !toDate ? '#02559d' : 'white', color: selectedPreset === 'all' && !fromDate && !toDate ? 'white' : '#475569' }}
              >
                All Time
              </button>
              <button
                onClick={() => handleSelectPreset('this_month')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #cbd5e1', background: selectedPreset === 'this_month' ? '#02559d' : 'white', color: selectedPreset === 'this_month' ? 'white' : '#475569' }}
              >
                This Month
              </button>
              <button
                onClick={() => handleSelectPreset('last_month')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #cbd5e1', background: selectedPreset === 'last_month' ? '#02559d' : 'white', color: selectedPreset === 'last_month' ? 'white' : '#475569' }}
              >
                Last Month
              </button>
              <button
                onClick={() => handleSelectPreset('last_30_days')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #cbd5e1', background: selectedPreset === 'last_30_days' ? '#02559d' : 'white', color: selectedPreset === 'last_30_days' ? 'white' : '#475569' }}
              >
                Last 30 Days
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>From:</span>
              <input 
                type="date" 
                value={fromDate} 
                onChange={e => { setFromDate(e.target.value); setSelectedPreset('all'); }} 
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: 'white', color: '#1e293b' }} 
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>To:</span>
              <input 
                type="date" 
                value={toDate} 
                onChange={e => { setToDate(e.target.value); setSelectedPreset('all'); }} 
                style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: 'white', color: '#1e293b' }} 
              />
            </div>
            {(fromDate || toDate) && (
              <button 
                onClick={() => handleSelectPreset('all')} 
                style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear Dates
              </button>
            )}
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, background: '#e2e8f0', padding: '4px 10px', borderRadius: '20px' }}>
              {filteredOrders.length} order(s) found
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setIsStatementModalOpen(true)}
              title="Download official Bank Statement with Anni Ponu revenue" 
              style={{ 
                background: '#047857', 
                color: 'white', 
                border: 'none', 
                padding: '9px 15px', 
                borderRadius: '7px', 
                fontSize: '13px', 
                fontWeight: 700, 
                cursor: 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px',
                boxShadow: '0 2px 6px rgba(4,120,87,0.25)'
              }}
            >
              📄 Bank Statement
            </button>
            <button 
              onClick={exportHistoryCSV} 
              title="Download full history as Excel/CSV" 
              style={{ 
                background: '#0284c7', 
                color: 'white', 
                border: 'none', 
                padding: '9px 15px', 
                borderRadius: '7px', 
                fontSize: '13px', 
                fontWeight: 600, 
                cursor: 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px',
                boxShadow: '0 1px 3px rgba(2,132,199,0.2)'
              }}
            >
              📊 Export CSV / Excel
            </button>
            <button 
              onClick={exportHistoryPDF} 
              title="Download summary statement as PDF" 
              style={{ 
                background: '#0f3162', 
                color: 'white', 
                border: 'none', 
                padding: '9px 15px', 
                borderRadius: '7px', 
                fontSize: '13px', 
                fontWeight: 600, 
                cursor: 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px',
                boxShadow: '0 1px 3px rgba(15,49,98,0.2)'
              }}
            >
              📄 PDF Ledger
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '15px' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search patient name, mobile number, UHID, or consignment number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '11px 12px 11px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
          />
        </div>

        {/* Table Container */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', color: '#0f172a' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', width: '45px' }}>#</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', minWidth: '180px' }}>Patient Details</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', minWidth: '160px' }}>Consignment & Tracking</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', minWidth: '190px' }}>Billing (Anni Ponu)</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', minWidth: '110px' }}>Order & Due</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', width: '80px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#475569', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', minWidth: '230px' }}>Actions & Slips</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>No medicine orders match your criteria</div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  let pImgs: string[] = [];
                  if (Array.isArray(order.prescriptionUrls)) {
                    pImgs = order.prescriptionUrls;
                  } else if (typeof order.prescriptionUrls === 'string') {
                    try {
                      const parsed = JSON.parse(order.prescriptionUrls);
                      if (Array.isArray(parsed)) pImgs = parsed;
                      else if (parsed) pImgs = [parsed];
                    } catch {
                      if (order.prescriptionUrls.startsWith('http') || order.prescriptionUrls.startsWith('/') || order.prescriptionUrls.startsWith('data:')) {
                        pImgs = [order.prescriptionUrls];
                      }
                    }
                  }

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '16px 14px', color: '#64748b', fontWeight: 700, fontSize: '13px' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '16px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: '#0f274a', fontSize: '15px' }}>{order.patientName}</span>
                          {order.uhid && (
                            <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 7px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.3px', border: '1px solid #bae6fd' }}>
                              🆔 {order.uhid}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>📞</span> {order.mobile}
                        </div>
                        {order.address && (
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.address}>
                            📍 {order.address}
                          </div>
                        )}
                        {pImgs.length > 0 && (
                          <div style={{ marginTop: '8px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {pImgs.slice(0, 3).map((url: string, pIdx: number) => (
                              <img 
                                key={pIdx} 
                                src={url} 
                                alt={`Prescription / Strip ${pIdx + 1}`} 
                                onClick={(e) => { e.stopPropagation(); setPreviewImageUrl(url); }}
                                title="Click to view full photo"
                                style={{ width: '34px', height: '34px', objectFit: 'cover', borderRadius: '5px', border: '1.5px solid #cbd5e1', cursor: 'pointer', background: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }} 
                              />
                            ))}
                            <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, background: '#f0f9ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                              📎 {pImgs.length} photo(s)
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Consignment & Tracking Field */}
                      <td style={{ padding: '16px 14px' }}>
                        {order.consignmentNo ? (
                          <div>
                            <span style={{ fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '3px 8px', borderRadius: '5px', fontSize: '12px', display: 'inline-block', border: '1px solid #bae6fd' }}>
                              📦 {order.consignmentNo}
                            </span>
                          </div>
                        ) : (
                          <div style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
                            No consignment yet
                          </div>
                        )}

                        {order.consignmentImage && (
                          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img 
                              src={order.consignmentImage} 
                              alt="Slip" 
                              onClick={() => setPreviewImageUrl(order.consignmentImage)}
                              style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                              title="Click to zoom consignment slip photo"
                            />
                            <span 
                              onClick={() => setPreviewImageUrl(order.consignmentImage)}
                              style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              📷 View Slip
                            </span>
                          </div>
                        )}

                        <div style={{ marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenConsignmentModal(order)}
                            style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ {order.consignmentNo ? 'Edit Consignment' : '+ Add Consignment'}
                          </button>
                        </div>
                      </td>

                      {/* Billing Breakdown (Anni Ponu Each User Dantlo) */}
                      <td style={{ padding: '16px 14px' }}>
                        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '5px 8px', marginBottom: '6px' }}>
                          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#047857', fontWeight: 800, letterSpacing: '0.4px' }}>
                            ★ Anni Ponu (Benva Revenue)
                          </div>
                          <div style={{ fontSize: '15px', color: '#065f46', fontWeight: 800 }}>
                            ₹{Number(order.finalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          MRP: <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{Number(order.totalMrp || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#dc2626' }}>
                          Disc: <span style={{ fontWeight: 600 }}>-₹{Number(order.discount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 14px', fontSize: '12px' }}>
                        <div style={{ color: '#64748b' }}>
                          Last: <span style={{ color: '#334155', fontWeight: 600 }}>{order.lastGivenDate ? new Date(order.lastGivenDate).toLocaleDateString('en-GB') : '-'}</span>
                        </div>
                        <div style={{ marginTop: '3px' }}>
                          Due: <span style={{ 
                            color: order.nextDueDate && new Date(order.nextDueDate) < new Date() ? '#dc2626' : '#0f172a', 
                            fontWeight: order.nextDueDate && new Date(order.nextDueDate) < new Date() ? 800 : 600 
                          }}>
                            {order.nextDueDate ? new Date(order.nextDueDate).toLocaleDateString('en-GB') : '-'}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 14px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          background: order.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9', 
                          color: order.status === 'ACTIVE' ? '#166534' : '#475569',
                          display: 'inline-block'
                        }}>
                          {order.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                          {/* Edit & Delete Controls */}
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button 
                              onClick={() => handleEdit(order)} 
                              style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '5px 11px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                              title="Edit Order"
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(order.id, order.patientName)} 
                              disabled={deletingOrderId === order.id}
                              style={{ 
                                background: '#fee2e2', 
                                color: '#dc2626', 
                                border: '1px solid #fecaca', 
                                padding: '5px 10px', 
                                borderRadius: '6px', 
                                cursor: deletingOrderId === order.id ? 'not-allowed' : 'pointer', 
                                fontWeight: 700, 
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Delete Order Permanently"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              {deletingOrderId === order.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>

                          {/* Method 1: Office Copy */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f8fafc', padding: '4px 8px', borderRadius: '7px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f3162', letterSpacing: '0.2px' }}>
                              🏢 Office:
                            </span>
                            <button 
                              onClick={() => generatePDF(order, 'view', 'internal')} 
                              disabled={generatingPdfId === `${order.id}-internal-view`}
                              style={{ background: '#0f3162', color: 'white', border: 'none', padding: '4px 9px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                              title="View Office Copy (Full Details with Mobile, Address & Billing)"
                            >
                              {generatingPdfId === `${order.id}-internal-view` ? '...' : '👁️ View'}
                            </button>
                            <button 
                              onClick={() => generatePDF(order, 'download', 'internal')} 
                              disabled={generatingPdfId === `${order.id}-internal-download`}
                              style={{ background: '#334155', color: 'white', border: 'none', padding: '4px 9px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                              title="Download Office Copy PDF"
                            >
                              {generatingPdfId === `${order.id}-internal-download` ? '...' : '📥 PDF'}
                            </button>
                          </div>

                          {/* Method 2: Pharmacy Slip */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f0f9ff', padding: '4px 8px', borderRadius: '7px', border: '1px solid #bae6fd' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', letterSpacing: '0.2px' }}>
                              💊 Pharmacy:
                            </span>
                            <button 
                              onClick={() => generatePDF(order, 'view', 'pharmacy')} 
                              disabled={generatingPdfId === `${order.id}-pharmacy-view`}
                              style={{ background: '#0284c7', color: 'white', border: 'none', padding: '4px 9px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                              title="View Pharmacy Dispatch Slip"
                            >
                              {generatingPdfId === `${order.id}-pharmacy-view` ? '...' : '👁️ View'}
                            </button>
                            <button 
                              onClick={() => generatePDF(order, 'download', 'pharmacy')} 
                              disabled={generatingPdfId === `${order.id}-pharmacy-download`}
                              style={{ background: '#0369a1', color: 'white', border: 'none', padding: '4px 9px', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                              title="Download Pharmacy Slip PDF"
                            >
                              {generatingPdfId === `${order.id}-pharmacy-download` ? '...' : '📥 PDF'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{editingOrder ? 'Edit Medicine Order' : 'New Medicine Order'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <form id="med-form" onSubmit={handleSubmit}>
                {/* ── STEP 1: MOBILE NUMBER & PATIENT / FAMILY LOOKUP ── */}
                {!isPatientConfirmed ? (
                  <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '20px' }}>📱</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f274a' }}>Step 1: Enter Mobile Number</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                          We will instantly search health checkups, patient records, consultations, and prior orders for existing family members and UHIDs.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', flex: '1 1 260px' }}>
                        <input 
                          type="tel" 
                          placeholder="Enter 10-digit mobile number..." 
                          value={formData.mobile} 
                          onChange={e => handlePhoneInputChange(e.target.value)}
                          maxLength={15}
                          autoFocus
                          style={{ 
                            width: '100%', 
                            padding: '12px 14px 12px 40px', 
                            borderRadius: '8px', 
                            border: '2px solid #0284c7', 
                            fontSize: '16px', 
                            fontWeight: 700, 
                            letterSpacing: '0.5px',
                            color: '#0f172a',
                            outline: 'none',
                            boxShadow: '0 0 0 3px rgba(2,132,199,0.15)'
                          }} 
                        />
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#64748b' }}>📞</span>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => handlePhoneLookup(formData.mobile)}
                        disabled={isSearchingPhone || formData.mobile.replace(/\D/g, '').length < 10}
                        style={{
                          background: '#0284c7',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: isSearchingPhone || formData.mobile.replace(/\D/g, '').length < 10 ? 'not-allowed' : 'pointer',
                          opacity: isSearchingPhone || formData.mobile.replace(/\D/g, '').length < 10 ? 0.6 : 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isSearchingPhone ? 'Searching...' : '🔍 Search Number'}
                      </button>
                    </div>

                    {/* Searching indicator */}
                    {isSearchingPhone && (
                      <div style={{ marginTop: '16px', padding: '12px', background: '#eff6ff', borderRadius: '8px', color: '#1d4ed8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⏳</span> Searching for registered patients & family members under this phone number...
                      </div>
                    )}

                    {/* If family members found */}
                    {!isSearchingPhone && hasSearched && foundFamilyMembers.length > 0 && !isNewMemberMode && (
                      <div style={{ marginTop: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f274a' }}>
                            👥 Registered Patients / Family Members Found ({foundFamilyMembers.length})
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Select who this order is for:</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {foundFamilyMembers.map((member, mIdx) => (
                            <div 
                              key={mIdx}
                              onClick={() => handleSelectFamilyMember(member)}
                              style={{
                                background: 'white',
                                border: '1.5px solid #cbd5e1',
                                borderRadius: '10px',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '12px',
                                transition: 'all 0.15s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#f0f9ff'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'white'; }}
                            >
                              <div style={{ flex: '1 1 240px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f274a' }}>{member.name}</span>
                                  {member.uhid ? (
                                    <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '5px', fontWeight: 800, border: '1px solid #bae6fd' }}>
                                      🆔 {member.uhid}
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                      UHID will be assigned
                                    </span>
                                  )}
                                  {(member.age || member.gender) && (
                                    <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                                      {member.age ? `Age: ${member.age}` : ''} {member.age && member.gender ? '•' : ''} {member.gender || ''}
                                    </span>
                                  )}
                                </div>

                                {member.address && (
                                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                    📍 {member.address}
                                  </div>
                                )}

                                {member.sources && member.sources.length > 0 && (
                                  <div style={{ display: 'flex', gap: '5px', marginTop: '6px', flexWrap: 'wrap' }}>
                                    {member.sources.map((s: string, sIdx: number) => (
                                      <span key={sIdx} style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                        ✓ {s}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleSelectFamilyMember(member); }}
                                  style={{
                                    background: '#0284c7',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✓ Select This Patient
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Option to add new family member under this number */}
                          <button
                            type="button"
                            onClick={handleStartNewMember}
                            style={{
                              background: '#f8fafc',
                              border: '2px dashed #94a3b8',
                              borderRadius: '10px',
                              padding: '12px',
                              textAlign: 'center',
                              color: '#0284c7',
                              fontWeight: 700,
                              fontSize: '14px',
                              cursor: 'pointer',
                              marginTop: '4px'
                            }}
                          >
                            + Add New Family Member / Patient Under This Number
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Input for new family member or when no prior records found */}
                    {!isSearchingPhone && hasSearched && (foundFamilyMembers.length === 0 || isNewMemberMode) && (
                      <div style={{ marginTop: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#0369a1', fontWeight: 600, marginBottom: '10px' }}>
                          {foundFamilyMembers.length === 0 
                            ? 'ℹ️ No existing records found for this phone number. Please enter patient name:' 
                            : `➕ Adding new family member under mobile number ${formData.mobile}:`}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ flex: '1 1 240px' }}>
                            <input 
                              type="text"
                              placeholder="Enter Patient Full Name *"
                              value={formData.patientName}
                              onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                              autoFocus
                              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600 }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleConfirmNewMember}
                            disabled={!formData.patientName.trim()}
                            style={{
                              background: '#16a34a',
                              color: 'white',
                              border: 'none',
                              padding: '10px 18px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '13px',
                              cursor: !formData.patientName.trim() ? 'not-allowed' : 'pointer',
                              opacity: !formData.patientName.trim() ? 0.6 : 1
                            }}
                          >
                            ✓ Confirm Patient & Proceed
                          </button>
                          {foundFamilyMembers.length > 0 && isNewMemberMode && (
                            <button
                              type="button"
                              onClick={() => setIsNewMemberMode(false)}
                              style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                            >
                              Back to Existing Members
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* CONFIRMED PATIENT BANNER */
                  <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', color: '#065f46', fontWeight: 700 }}>✓ Selected Patient:</span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f274a' }}>{formData.patientName}</span>
                        {formData.uhid ? (
                          <span style={{ fontSize: '12px', background: '#0284c7', color: 'white', padding: '2px 8px', borderRadius: '5px', fontWeight: 800 }}>
                            🆔 {formData.uhid}
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '5px', fontWeight: 700, border: '1px solid #86efac' }}>
                            🆔 UHID will be assigned upon save
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#047857', marginTop: '4px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        <span>📞 <strong>Mobile:</strong> {formData.mobile}</span>
                        {formData.address && <span>📍 <strong>Address:</strong> {formData.address.slice(0, 40)}...</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPatientConfirmed(false)}
                      style={{
                        background: 'white',
                        color: '#0f274a',
                        border: '1px solid #cbd5e1',
                        padding: '7px 14px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Change / Re-select Patient
                    </button>
                  </div>
                )}

                {/* ── STEP 2: REMAINING DETAILS (REVEALED ONLY AFTER PATIENT CONFIRMED) ── */}
                {isPatientConfirmed ? (
                  <div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Delivery Address</label>
                  <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Last Given Date</label>
                    <input type="date" value={formData.lastGivenDate} onChange={e => setFormData({...formData, lastGivenDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155' }}>Next Due Date</label>
                    <input type="date" value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                {/* Billing & Discount Card */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💳 Billing & Discount Details
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#475569' }}>Total MRP (₹)</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="any"
                        placeholder="e.g. 1500" 
                        value={formData.totalMrp} 
                        onChange={e => handleMrpChange(e.target.value)} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#475569' }}>Discount Given (₹)</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="any"
                        placeholder="e.g. 300" 
                        value={formData.discount} 
                        onChange={e => handleDiscountChange(e.target.value)} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#16a34a', fontWeight: 600 }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#475569' }}>Final Paid Amount (₹)</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="any"
                        placeholder="e.g. 1200" 
                        value={formData.finalAmount} 
                        onChange={e => setFormData({ ...formData, finalAmount: e.target.value })} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ecfdf5', color: '#065f46', fontWeight: 700 }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Consignment & Courier Tracking Section */}
                <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📦 Consignment & Courier Tracking Details
                    </h4>
                    <span style={{ fontSize: '11px', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Pharmacy Dispatch
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'flex-start' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#0369a1' }}>
                        Consignment / Courier Tracking Number
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. BEN-CONG-9821 / DTDC / SpeedPost" 
                        value={formData.consignmentNo} 
                        onChange={e => setFormData({ ...formData, consignmentNo: e.target.value })} 
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #93c5fd', fontWeight: 600, background: 'white', boxSizing: 'border-box' }} 
                      />
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Enter courier tracking number or dispatch reference.
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px', color: '#0369a1' }}>
                        Consignment Slip / Parcel Photo
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label style={{
                          background: isUploadingConsignmentSlip ? '#94a3b8' : '#0284c7',
                          color: 'white',
                          padding: '9px 15px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: isUploadingConsignmentSlip ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                        }}>
                          {isUploadingConsignmentSlip ? '⏳ Uploading...' : formData.consignmentImage ? '✓ Change Slip' : '📷 Upload Slip Image'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }}
                            disabled={isUploadingConsignmentSlip}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingConsignmentSlip(true);
                              try {
                                const uFormData = new FormData();
                                uFormData.append('file', file);
                                const res = await fetch('/api/upload-direct', { method: 'POST', body: uFormData });
                                if (res.ok) {
                                  const data = await res.json();
                                  const url = data.url || data.fileUrl;
                                  if (url) {
                                    setFormData(prev => ({ ...prev, consignmentImage: url }));
                                  }
                                }
                              } catch (err) {
                                console.error(err);
                                alert('Upload failed');
                              } finally {
                                setIsUploadingConsignmentSlip(false);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                        {formData.consignmentImage && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img 
                              src={formData.consignmentImage} 
                              alt="Slip" 
                              onClick={() => setPreviewImageUrl(formData.consignmentImage)}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '5px', border: '1.5px solid #0284c7', cursor: 'pointer' }}
                              title="Click to preview slip"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, consignmentImage: '' }))}
                              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '5px 9px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                        Upload photo of courier receipt, parcel booking slip, or dispatch label.
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: 600 }}>Uploaded Prescriptions & Medicine Strips</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Attach doctor prescriptions and customer WhatsApp medicine strip photos</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {uploadSuccessMessage && (
                        <div style={{ 
                          background: '#ecfdf5', 
                          border: '1px solid #10b981', 
                          color: '#065f46', 
                          padding: '6px 12px', 
                          borderRadius: '6px', 
                          fontSize: '13px', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {uploadSuccessMessage}
                        </div>
                      )}
                      <div style={{ display: 'inline-block' }}>
                        <label 
                          htmlFor="prescription-file-input"
                          style={{ 
                            background: isUploadingImage ? '#94a3b8' : uploadSuccessMessage ? '#10b981' : '#2563eb', 
                            color: 'white', 
                            padding: '9px 18px', 
                            borderRadius: '6px', 
                            cursor: isUploadingImage ? 'not-allowed' : 'pointer', 
                            fontWeight: 600,
                            fontSize: '14px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                            userSelect: 'none'
                          }}
                        >
                          {isUploadingImage 
                            ? '⏳ Uploading...' 
                            : uploadSuccessMessage 
                              ? '✓ Uploaded Successfully!' 
                              : '+ Upload Prescriptions / Strips'}
                        </label>
                        <input 
                          id="prescription-file-input"
                          type="file" 
                          accept="image/*" 
                          multiple 
                          disabled={isUploadingImage}
                          onChange={handleFileUpload} 
                          style={{ display: 'none' }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '10px 4px', minHeight: '130px', alignItems: 'center' }}>
                    {formData.prescriptionUrls.map((url, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          position: 'relative', 
                          width: '130px', 
                          height: '130px', 
                          flexShrink: 0, 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        <img 
                          src={url} 
                          alt={`Prescription / Strip ${i + 1}`} 
                          onClick={() => setPreviewImageUrl(url)}
                          title="Click to zoom in"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setFormData({...formData, prescriptionUrls: formData.prescriptionUrls.filter((_, idx) => idx !== i)})} 
                          title="Delete image"
                          style={{ 
                            position: 'absolute', 
                            top: '6px', 
                            right: '6px', 
                            background: '#ef4444', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '50%', 
                            width: '24px', 
                            height: '24px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            lineHeight: 1
                          }}
                        >
                          &times;
                        </button>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.65)', color: 'white', fontSize: '11px', textAlign: 'center', padding: '2px 0' }}>
                          Photo {i + 1}
                        </div>
                      </div>
                    ))}
                    {formData.prescriptionUrls.length === 0 && (
                      <label 
                        htmlFor="prescription-file-input"
                        style={{ 
                          width: '100%', 
                          padding: '24px 20px', 
                          textAlign: 'center', 
                          border: '2px dashed #93c5fd', 
                          borderRadius: '8px', 
                          background: '#f8fafc',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ fontSize: '26px' }}>📷</div>
                        <div style={{ color: '#0284c7', fontWeight: 600, fontSize: '14px' }}>
                          Click here or "+ Upload Prescriptions / Strips" to attach files
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                          Supports prescriptions, medicine strip photos from WhatsApp, JPG, PNG & scans
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>Medicines List (For Pharmacy)</h3>
                    <button type="button" onClick={handleAddMedicine} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Add Medicine Row</button>
                  </div>
                  
                  {formData.medicines.map((med, i) => (
                    <div key={med.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <input type="checkbox" checked={med.isSelected !== false} onChange={e => handleMedicineChange(i, 'isSelected', e.target.checked)} title="Include in Pharmacy PDF" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                      </div>
                      <div style={{ flex: 2 }}>
                        <input type="text" placeholder="Medicine Name" value={med.name} onChange={e => handleMedicineChange(i, 'name', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <select value={med.type} onChange={e => handleMedicineChange(i, 'type', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option>Tablet</option>
                          <option>Strip</option>
                          <option>Capsule</option>
                          <option>Syrup</option>
                          <option>Injection</option>
                          <option>Ointment</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="text" placeholder="Quantity (e.g. 2 Strips)" value={med.quantity} onChange={e => handleMedicineChange(i, 'quantity', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 2 }}>
                        <input type="text" placeholder="Instructions (Optional)" value={med.instructions} onChange={e => handleMedicineChange(i, 'instructions', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <button type="button" onClick={() => handleRemoveMedicine(i)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>X</button>
                      </div>
                    </div>
                  ))}
                  {formData.medicines.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Click "Add Medicine Row" to type out medicines from the prescription.</p>}
                </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '10px', border: '2px dashed #cbd5e1', marginTop: '10px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>👆</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>
                    Select a patient or confirm a new patient name above to proceed
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '4px', color: '#64748b' }}>
                    Address, order dates, billing breakdown, prescriptions, and pharmacy medicines table will appear here.
                  </div>
                </div>
              )}

            </form>
          </div>
          
          <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#f8fafc' }}>
            <button onClick={() => setIsAddModalOpen(false)} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            {isPatientConfirmed && (
              <button type="submit" form="med-form" style={{ background: '#0284c7', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(2,132,199,0.35)' }}>Save Order</button>
            )}
          </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewImageUrl && (
        <div 
          onClick={() => setPreviewImageUrl(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img src={previewImageUrl} alt="Prescription Preview" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} />
            <button 
              onClick={() => setPreviewImageUrl(null)}
              style={{ position: 'absolute', top: '-15px', right: '-15px', background: 'white', color: '#0f172a', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >
              &times;
            </button>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <a href={previewImageUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline', fontSize: '14px' }}>
                Open original in new tab
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Official Bank Statement Modal for Medicines */}
      {isStatementModalOpen && (
        <MedicineRevenueStatementModal
          onClose={() => setIsStatementModalOpen(false)}
          transactions={statementTransactions}
          summary={revenueSummary}
          dateRange={{
            from: fromDate,
            to: toDate,
            label: getDateRangeLabel()
          }}
        />
      )}

      {/* Quick Edit / Add Consignment Details Modal */}
      {editingConsignmentOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  📦 Consignment & Dispatch Tracking
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  Patient: <span style={{ fontWeight: 600, color: '#0284c7' }}>{editingConsignmentOrder.patientName}</span> ({editingConsignmentOrder.uhid || editingConsignmentOrder.mobile})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingConsignmentOrder(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Consignment / Tracking Number
              </label>
              <input
                type="text"
                placeholder="e.g. BEN-CONG-9821 / DTDC / SpeedPost"
                value={consignmentForm.consignmentNo}
                onChange={e => setConsignmentForm({ ...consignmentForm, consignmentNo: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Consignment Slip / Parcel Photo
              </label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{
                  background: isUploadingConsignmentSlip ? '#94a3b8' : '#0284c7',
                  color: 'white',
                  padding: '9px 16px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isUploadingConsignmentSlip ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {isUploadingConsignmentSlip ? '⏳ Uploading...' : consignmentForm.consignmentImage ? '✓ Change Slip' : '📷 Upload Slip Image'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={isUploadingConsignmentSlip}
                    onChange={handleUploadConsignmentSlip}
                  />
                </label>

                {consignmentForm.consignmentImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={consignmentForm.consignmentImage}
                      alt="Slip preview"
                      onClick={() => setPreviewImageUrl(consignmentForm.consignmentImage)}
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #0284c7', cursor: 'pointer' }}
                      title="Click to view slip photo"
                    />
                    <button
                      type="button"
                      onClick={() => setConsignmentForm({ ...consignmentForm, consignmentImage: '' })}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                Upload courier receipt, dispatch label, or parcel booking slip photo.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEditingConsignmentOrder(null)}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConsignment}
                style={{ background: '#0284c7', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '7px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)' }}
              >
                Save Consignment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
