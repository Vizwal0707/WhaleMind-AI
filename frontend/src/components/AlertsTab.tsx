'use client';

import React, { useEffect, useState } from 'react';
import { fetchFromAPI } from '../lib/api';
import { BellRing, ShieldAlert, Sparkles, HelpCircle, EyeOff, CheckCircle } from 'lucide-react';

export default function AlertsTab() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      const data = await fetchFromAPI('/backtest/alerts');
      setAlerts(data);
      setLoading(false);
    }
    loadAlerts();
  }, []);

  const handleDismissAlert = (index: number) => {
    setAlerts(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClearAll = () => {
    setAlerts([]);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const getAlertColors = (severity: string) => {
    if (severity === 'CRITICAL') return { bg: 'rgba(244,67,54,0.1)', border: '#F44336', text: '#F44336' };
    if (severity === 'WARNING') return { bg: 'rgba(255,152,0,0.1)', border: '#FF9800', text: '#FF9800' };
    return { bg: 'rgba(59,130,246,0.1)', border: '#3B82F6', text: '#3B82F6' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="animate-fade-in">
      
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', textAlign: 'left' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>Alert Intelligence Center</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Real-time triggers mapping large transaction spikes and automated neural prediction status overrides.
          </p>
        </div>

        {alerts.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="btn btn-secondary"
            style={{ fontSize: '12px' }}
          >
            Clear All Alerts
          </button>
        )}
      </div>

      {/* Alerts logs list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
        {alerts.length > 0 ? (
          alerts.map((al, idx) => {
            const clr = getAlertColors(al.severity);
            return (
              <div 
                key={idx}
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderRadius: '10px',
                  borderLeft: `4px solid ${clr.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: clr.bg,
                    color: clr.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {al.severity === 'CRITICAL' ? (
                      <ShieldAlert size={18} />
                    ) : (
                      <BellRing size={18} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', color: clr.border, letterSpacing: '0.5px' }}>
                        {al.alert_type}
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>• Just now</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500, marginTop: '4px', lineHeight: '1.4' }}>
                      {al.message}
                    </p>
                  </div>
                </div>

                {/* Dismiss CTA */}
                <button 
                  onClick={() => handleDismissAlert(idx)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    transition: 'color 0.2s'
                  }}
                  className="btn-text"
                >
                  <EyeOff size={14} />
                  <span>Mute</span>
                </button>
              </div>
            );
          })
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={40} style={{ color: '#4CAF50', opacity: 0.5, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>System Alert Log Empty</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              No critical whale transfers or anomalous flow spikes have been recorded in this monitoring epoch.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
