'use client';

import React, { useEffect, useState } from 'react';
import styles from './InstallPrompt.module.css';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // We check session storage so we don't annoy the user if they dismissed it this session
      const hasDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      if (!hasDismissed) {
        setIsPromptVisible(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsPromptVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Expose the install function to the window so other components (like Admin sidebar) can trigger it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).triggerPWAInstall = async () => {
        if (deferredPrompt) {
          setIsPromptVisible(true);
        } else {
          alert('Install prompt is not available yet or app is already installed.');
        }
      };
    }
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsPromptVisible(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We can't use the prompt again
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsPromptVisible(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!isPromptVisible || isInstalled) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <img 
            src="/icon-192x192.png" 
            alt="Benva Logo" 
            className={styles.icon}
          />
          <h2 className={styles.title}>Install Benva Healthcare</h2>
          <p className={styles.description}>
            Add our app to your home screen for quick, seamless access to quality healthcare at your fingertips.
          </p>
        </div>
        
        <div className={styles.actions}>
          <button className={styles.installButton} onClick={handleInstallClick}>
            Install App
          </button>
          <button className={styles.dismissButton} onClick={handleDismiss}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
