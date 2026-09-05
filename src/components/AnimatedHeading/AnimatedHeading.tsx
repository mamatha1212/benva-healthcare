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
  const words = textContent.split(' ');

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

  const Component = as;

  return (
    <Component ref={ref} className={className} style={{ perspective: '400px' }}>
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <span className={styles.wordWrapper}>
            <span 
              className={`${styles.wordInner} ${isVisible ? styles.visible : ''}`} 
              style={{ transitionDelay: `${index * 0.06}s` }}
            >
              {word}
            </span>
          </span>
          {/* Add a regular space outside the wrapper so natural line wrapping works */}
          {index < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </Component>
  );
}
