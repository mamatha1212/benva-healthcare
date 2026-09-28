'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, X } from 'lucide-react';
import styles from './CustomFileInput.module.css';

interface CustomFileInputProps {
  label: string;
  accept?: string;
  required?: boolean;
  name?: string;
}

export default function CustomFileInput({ label, accept = '*', required = false, name }: CustomFileInputProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        {label} {required && <span className={styles.asterisk}>*</span>}
      </label>
      
      <div className={`${styles.uploadBox} ${fileName ? styles.hasFile : ''}`}>
        <input
          type="file"
          name={name}
          accept={accept}
          required={required && !fileName}
          onChange={handleFileChange}
          ref={fileInputRef}
          className={styles.hiddenInput}
        />
        
        {!fileName ? (
          <div className={styles.placeholder}>
            <UploadCloud size={24} className={styles.icon} />
            <div className={styles.text}>
              <span className={styles.browse}>Click to upload</span> or drag and drop
            </div>
            <div className={styles.hint}>PDF, JPG, PNG up to 10MB</div>
          </div>
        ) : (
          <div className={styles.filePreview}>
            <CheckCircle2 size={24} className={styles.successIcon} />
            <span className={styles.fileName}>{fileName}</span>
            <button className={styles.removeBtn} onClick={handleRemoveFile} title="Remove file">
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
