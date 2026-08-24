'use client';
import React, { useEffect, useRef, useState } from 'react';
import styles from './AnimatedHeading.module.css';

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function AnimatedHeading({ children, className = '', as = 'h2' }: AnimatedHeadingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const ref = useRef<HTMLHeadingElement>(null);

  // Helper to extract text from ReactNode safely
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (React.isValidElement(node)) return extractText((node as any).props.children);
    return '';
  };

  const textContent = extractText(children);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isVisible && textContent) {
      const words = textContent.split(' ');
      let i = 0;
      setDisplayedText('');
      setIsTyping(true);
      const intervalId = setInterval(() => {
        setDisplayedText(words.slice(0, i + 1).join(' '));
        i++;
        if (i >= words.length) {
          clearInterval(intervalId);
          setIsTyping(false);
        }
      }, 150); // Speed per word (150ms)
      
      return () => clearInterval(intervalId);
    }
  }, [isVisible, textContent]);

  const Component = as;

  return (
    <Component ref={ref} className={className}>
      {isVisible ? displayedText : ''}
      {isTyping && <span className={styles.cursor} >|</span>}
    </Component>
  );
}
