'use client';
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function DietPlanPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    whatsapp: '',
    email: '',
    state: '',
    district: '',
    area: '',
    pincode: '',
    age: '',
    gender: '',
    weight: '',
    height: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/diet-plans');
        if (res.ok) {
          const data = await res.json();
          setPlans(data.filter((p: any) => p.isActive));
        }
      } catch (err) {
        console.error('Failed to fetch plans', err);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/diet-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to submit form');

      setSuccess(true);
      setFormData({
        fullName: '', mobile: '', whatsapp: '', email: '',
        state: '', district: '', area: '', pincode: '',
        age: '', gender: '', weight: '', height: ''
      });
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.banner}>
            <div className={styles.bannerDecor}>
              <div className={styles.bannerCircle1} />
              <div className={styles.bannerCircle2} />
            </div>

            <h2 className={styles.bannerTitle}>180 Days PCOS/PCOD Complete Care Program</h2>
            
            <div className={styles.bannerContent}>
              <div className={styles.pricingBox}>
                <span className={styles.annualText}>Select a Plan Below</span>
                <div className={styles.priceDisplay}>
                  <span className={styles.amount} style={{fontSize: '48px'}}>Get Started</span>
                </div>
                <div className={styles.dailyCost}>With Expert Guidance</div>
              </div>

              <div className={styles.valueBox}>
                <span className={styles.actualPriceText}>Expert Guidance</span>
                <div className={styles.strikethroughPrice} style={{fontSize: '24px', textDecoration: 'none'}}>Dedicated Dietitian & Gynecologist</div>
                <div className={styles.saveBadge}>Personalized Care</div>
              </div>
            </div>

            <div className={styles.bannerFooter}>
              Personalized Nutrition • Hormonal Balance • Lifestyle Transformation
            </div>
          </div>
          <button className={styles.heroApplyBtn} onClick={() => document.getElementById('consultationForm')?.scrollIntoView({ behavior: 'smooth' })}>
            Book Consultation
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </button>
        </div>
        <div className={styles.heroDecor}>
          <div className={styles.circle1} />
          <div className={styles.circle2} />
          <div className={styles.circle3} />
        </div>
      </section>


      <div className={styles.wrapper}>
        <div className={styles.contentGrid}>
          
          {/* Information Section */}
          <div className={styles.infoSection}>
            <div className={styles.infoBlock}>
              <h2 className={styles.blockTitle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                WHY CHOOSE THIS PROGRAM?
              </h2>
              <ul className={styles.featureList}>
                {['Dedicated Dietitian Monitoring', 'Progress Review Call Every 15 Days', '1 Monthly Gynecologist On-Call Consultation', 'Continuous Progress Tracking', 'Regular WhatsApp Support'].map((f, i) => (
                  <li key={i} className={styles.featureItem}>
                    <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.infoBlock}>
              <h2 className={styles.blockTitle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                WHAT YOU GET
              </h2>
              {plansLoading ? (
                <div style={{ padding: '10px 0', color: '#64748b' }}>Loading plans...</div>
              ) : plans.length === 0 ? (
                <div style={{ padding: '10px 0', color: '#64748b' }}>No plans available.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plans.map((plan, index) => {
                    const isOpen = openPlanId === plan.id || (openPlanId === null && index === 0);
                    return (
                      <div key={plan.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                        <button 
                          type="button"
                          onClick={() => setOpenPlanId(isOpen ? '' : plan.id)}
                          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: isOpen ? '#f8fafc' : 'white', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{plan.title} {plan.price ? `(₹${plan.price})` : ''}</span>
                          <svg style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        {isOpen && (
                          <div style={{ padding: '0 20px 20px 20px', background: isOpen ? '#f8fafc' : 'white' }}>
                            {plan.benefits.length === 0 ? (
                              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No benefits added.</p>
                            ) : (
                              <ul className={styles.featureList} style={{ marginTop: '12px' }}>
                                {plan.benefits.map((b: any) => (
                                  <li key={b.id} className={styles.featureItem} style={{ marginBottom: '8px' }}>
                                    <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    <span>{b.name}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>


          </div>

          {/* Form Section */}
          <div>
            <div id="consultationForm" className={styles.formStickyWrapper}>
              <div className={styles.formBox}>
                <h2 className={styles.formTitle}>Get Started Today</h2>
                
                {success ? (
                  <div className={styles.successMessage}>
                    Thank you! Your enquiry has been submitted. Our team will contact you shortly.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                <div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Full Name *</label>
                    <input type="text" name="fullName" required className={styles.input} value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" />
                  </div>
                </div>

                <div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email Address *</label>
                    <input type="email" required name="email" className={styles.input} value={formData.email} onChange={handleChange} placeholder="e.g. name@gmail.com" />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Mobile Number *</label>
                    <input type="tel" name="mobile" required className={styles.input} value={formData.mobile} onChange={handleChange} placeholder="Enter 10-digit number" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>WhatsApp Number</label>
                    <input type="tel" name="whatsapp" className={styles.input} value={formData.whatsapp} onChange={handleChange} placeholder="Optional" />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Age *</label>
                    <input type="number" name="age" required className={styles.input} value={formData.age} onChange={handleChange} placeholder="e.g. 28" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Gender *</label>
                    <select name="gender" required className={styles.select} value={formData.gender} onChange={handleChange}>
                      <option value="">Select Gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Weight (kg) *</label>
                    <input type="text" name="weight" required className={styles.input} value={formData.weight} onChange={handleChange} placeholder="e.g. 65" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Height (cm) *</label>
                    <input type="text" name="height" required className={styles.input} value={formData.height} onChange={handleChange} placeholder="e.g. 160" />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>State *</label>
                    <input type="text" name="state" required className={styles.input} value={formData.state} onChange={handleChange} placeholder="Enter your state" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>District *</label>
                    <input type="text" name="district" required className={styles.input} value={formData.district} onChange={handleChange} placeholder="Enter your district" />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Area / City *</label>
                    <input type="text" name="area" required className={styles.input} value={formData.area} onChange={handleChange} placeholder="Enter your area" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Pincode *</label>
                    <input type="text" name="pincode" required className={styles.input} value={formData.pincode} onChange={handleChange} placeholder="Enter pincode" />
                  </div>
                </div>

                  {error && <p style={{ color: '#dc2626', marginTop: '10px', fontSize: '0.9rem' }}>{error}</p>}
                  
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Centered Sections */}
      <div className={styles.fullWidthSection}>
          <div className={styles.infoBlock} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className={styles.blockTitle} style={{ justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>
              DESIGNED TO SUPPORT
            </h2>
            <div className={styles.supportGrid}>
              <div className={styles.supportCard}>
                <div className={styles.supportIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div className={styles.supportText}>Irregular Periods</div>
              </div>
              <div className={styles.supportCard}>
                <div className={styles.supportIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                </div>
                <div className={styles.supportText}>Weight Management</div>
              </div>
              <div className={styles.supportCard}>
                <div className={styles.supportIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                </div>
                <div className={styles.supportText}>Hormonal Imbalance</div>
              </div>
              <div className={styles.supportCard}>
                <div className={styles.supportIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <div className={styles.supportText}>Low Energy Levels</div>
              </div>
              <div className={styles.supportCard}>
                <div className={styles.supportIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                </div>
                <div className={styles.supportText}>Focus on Management</div>
              </div>
              <div className={styles.supportCard}>
                <div className={styles.supportIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
                </div>
                <div className={styles.supportText}>Healthy Lifestyle Habits</div>
              </div>
            </div>
          </div>

          <div className={styles.consistencyBox}>
            <div className={styles.consistencyBgWatermark}>180</div>
            <div className={styles.consistencyContent}>
              <div className={styles.consistencyTitle}>CONSISTENCY CREATES RESULTS</div>
              <p className={styles.consistencyDesc}>Follow the program for 180 days under expert guidance and build sustainable healthy habits.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
