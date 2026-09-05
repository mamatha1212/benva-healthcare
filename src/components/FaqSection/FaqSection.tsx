'use client';
import React, { useState } from 'react';
import styles from './FaqSection.module.css';
import AnimatedHeading from '../AnimatedHeading/AnimatedHeading';
import ScrollReveal from '../ScrollReveal/ScrollReveal';

const faqs = [
  {
    question: 'What Services Does BENVA Healthcare Provide?',
    answer: 'BENVA Healthcare facilitates health checkups, home sample collection, medicine assistance, teleconsultation and home healthcare services through trusted healthcare partners.',
  },
  {
    question: 'How Do I Book A Health Checkup?',
    answer: 'Select the health package, submit your details and our healthcare team will contact you to confirm your booking.',
  },
  {
    question: 'Do You Provide Home Sample Collection?',
    answer: 'Yes. Home sample collection is available in selected locations through our partner laboratories.',
  },
  {
    question: 'How Will I Receive My Reports?',
    answer: 'Reports will be shared digitally through WhatsApp, email or other available channels.',
  },
  {
    question: 'How Do I Order Medicines?',
    answer: 'You can send your valid doctor prescription through WhatsApp and our team will assist you through partner pharmacies.',
  },
  {
    question: 'Do You Have Membership Plans?',
    answer: 'Yes. BENVA Healthcare offers membership programs with healthcare benefits and support services.',
  },
  {
    question: 'Which Areas Do You Serve?',
    answer: 'Services are currently available across selected locations in Andhra Pradesh and Telangana.',
  },
  {
    question: 'How Will BENVA Contact Me?',
    answer: 'Our team may contact you through phone call, WhatsApp or email regarding your service request.',
  },
  {
    question: 'Is Teleconsultation Available?',
    answer: 'Teleconsultation support may be available through qualified healthcare professionals and partner providers.',
  },
  {
    question: 'How Can I Contact BENVA Healthcare?',
    answer: 'You can contact us through phone, WhatsApp, email or the contact form available on the website.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.section} id="faq">
      {/* Background Decor */}
      <div className={styles.bgDecor}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon fill="rgba(255,255,255,0.03)" points="0,100 100,0 100,100" />
        </svg>
      </div>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.taglineWrapper}>
            <div className={styles.lineLeft}>
              <div className={styles.diamond} />
              <div className={styles.line} />
            </div>
            <span className={styles.tagline}>FAQs</span>
            <div className={styles.lineRight}>
              <div className={styles.line} />
              <div className={styles.diamond} />
            </div>
          </div>
          <AnimatedHeading className={styles.heading}>Frequently Asked Questions</AnimatedHeading>
        </div>

        {/* FAQ Accordion */}
        <div className={styles.accordionContainer}>
          <div className={`${styles.accordionGrid} ${showAll ? styles.expanded : ''}`}>
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <ScrollReveal key={index} animation="fadeUp" delay={(index % 5) * 0.1}>
                  <div 
                    className={`${styles.accordionItem} ${isOpen ? styles.active : ''}`}
                  >
                    <button 
                      className={styles.accordionButton} 
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.questionText}>{faq.question}</span>
                      <span className={styles.iconWrapper}>
                        <svg 
                          className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </button>
                    <div 
                      className={styles.accordionContent}
                      style={{ maxHeight: isOpen ? '200px' : '0' }}
                    >
                      <div className={styles.answerText}>
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
          
          {/* View More Button for Mobile */}
          {!showAll && (
            <div className={styles.viewMoreContainer}>
              <button 
                className={styles.viewMoreButton} 
                onClick={() => setShowAll(true)}
              >
                View More FAQs
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
