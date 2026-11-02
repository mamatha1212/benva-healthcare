'use client';

import React, { useRef, useState, useEffect } from 'react';
import styles from './DateInput.module.css';
import { formatDate, toISODateString, dmyToYmd } from '@/lib/dateUtils';

interface DateInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function DateInput({
  id,
  name,
  value,
  defaultValue,
  placeholder = 'DD/MM/YYYY',
  required,
  disabled,
  readOnly,
  className = '',
  style,
  inputStyle,
  onChange,
  onBlur,
}: DateInputProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Compute initial display value (DD/MM/YYYY)
  const initialRaw = value !== undefined ? value : (defaultValue || '');
  const initialDisplay = initialRaw ? formatDate(initialRaw, '') : '';
  const [displayText, setDisplayText] = useState<string>(initialDisplay);

  // Sync when value prop changes from parent
  useEffect(() => {
    if (value !== undefined) {
      setDisplayText(value ? formatDate(value, '') : '');
    }
  }, [value]);

  const triggerChange = (isoVal: string) => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = isoVal;
    }
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || '',
          value: isoVal,
          type: 'date',
        },
        currentTarget: {
          name: name || '',
          value: isoVal,
          type: 'date',
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    }
  };

  // Open calendar picker
  const handleOpenPicker = () => {
    if (disabled || readOnly) return;
    const picker = hiddenInputRef.current;
    if (picker) {
      try {
        if ('showPicker' in HTMLInputElement.prototype) {
          picker.showPicker();
        } else {
          picker.focus();
          picker.click();
        }
      } catch {
        picker.click();
      }
    }
  };

  // When date is chosen from calendar picker
  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    if (isoVal) {
      const formatted = formatDate(isoVal, '');
      setDisplayText(formatted);
      triggerChange(isoVal);
    } else {
      setDisplayText('');
      triggerChange('');
    }
  };

  // Text input formatting (DD/MM/YYYY)
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    
    // Only allow digits and slashes
    raw = raw.replace(/[^\d/]/g, '');

    // Auto-insert slash after day and month if user is just typing numbers
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digitsOnly;
    if (digitsOnly.length > 2 && digitsOnly.length <= 4) {
      formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
    } else if (digitsOnly.length > 4) {
      formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
    }

    setDisplayText(formatted);

    // If a full DD/MM/YYYY date is typed (10 chars), convert to ISO and fire onChange
    if (formatted.length === 10) {
      const iso = dmyToYmd(formatted);
      if (iso) {
        triggerChange(iso);
      }
    } else if (formatted.length === 0) {
      triggerChange('');
    }
  };

  const handleTextBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // If incomplete on blur, try to validate or clear
    if (displayText && displayText.length === 10) {
      const iso = dmyToYmd(displayText);
      if (iso) {
        triggerChange(iso);
      }
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  const currentIso = value ? toISODateString(value) : (displayText ? dmyToYmd(displayText) : '');

  return (
    <div className={`${styles.container} ${className}`} style={style}>
      <input
        ref={textInputRef}
        id={id}
        type="text"
        placeholder={placeholder}
        value={displayText}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={10}
        className={styles.textInput}
        style={inputStyle}
      />

      <button
        type="button"
        className={styles.calendarButton}
        onClick={handleOpenPicker}
        disabled={disabled || readOnly}
        title="Open calendar"
        aria-label="Open calendar"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {/* Hidden native date picker to provide calendar popup across all browsers and native form submission */}
      <input
        ref={hiddenInputRef}
        type="date"
        name={name}
        lang="en-IN"
        value={currentIso}
        onChange={handleHiddenDateChange}
        disabled={disabled || readOnly}
        tabIndex={-1}
        className={styles.hiddenDateInput}
        aria-hidden="true"
      />
    </div>
  );
}
