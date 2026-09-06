'use client';
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SERVICES = [
  { key: 'HEALTH_CHECKUP', name: 'Health Checkups', color: '#38a169' },
  { key: 'MEMBERSHIP', name: 'Memberships', color: '#805ad5' },
  { key: 'DIET_PLAN', name: 'Diet Plans', color: '#d53f8c' },
  { key: 'AVAILABILITY', name: 'Area Enquiries', color: '#dd6b20' },
  { key: 'CONTACT_US', name: 'Contact Form', color: '#e53e3e' },
  { key: 'CALLBACK_REQUEST', name: 'Callbacks', color: '#d69e2e' },
  { key: 'HOME_HEALTHCARE', name: 'Home Healthcare', color: '#3182ce' } // Kept for historical data
];

export default function LeadsChart({ leads }: { leads: any[] }) {
  const data = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize data array for each month
    const monthlyData = months.map(month => {
      const obj: any = { name: month };
      SERVICES.forEach(s => {
        obj[s.name] = 0;
      });
      return obj;
    });
    
    leads.forEach(lead => {
      if (lead.createdAt && lead.enquiryType) {
        const date = new Date(lead.createdAt);
        const monthIndex = date.getMonth();
        const service = SERVICES.find(s => s.key === lead.enquiryType);
        
        if (service) {
          monthlyData[monthIndex][service.name] += 1;
        }
      }
    });

    return monthlyData;
  }, [leads]);

  return (
    <div style={{ width: '100%', height: 450, background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginTop: '30px' }}>
      <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 700, color: '#334155' }}>Monthly Leads Overview (By Service)</h3>
      <div style={{ width: '100%', height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dx={-10} allowDecimals={false} />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {SERVICES.map((s, idx) => (
              <Bar 
                key={s.key} 
                dataKey={s.name} 
                stackId="a" 
                fill={s.color} 
                maxBarSize={50} 
                radius={
                  // Only add radius to top if it's the last item, though stacked radius is tricky in Recharts.
                  // Defaulting to 0 radius for stacked bars is usually cleaner.
                  [0, 0, 0, 0]
                } 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
