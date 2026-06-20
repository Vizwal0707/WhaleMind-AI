'use client';

import React, { useEffect, useState } from 'react';
import { fetchFromAPI } from '../lib/api';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SignalsTab() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSignals() {
      const data = await fetchFromAPI('/backtest/signals');
      setSignals(data);
      setLoading(false);
    }
    loadSignals();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="animate-fade-in">
      
      {/* Page Title */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>Active Trading Signals</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          GNN-derived buy and sell setups with computed confidence bounds and target risk controls.
        </p>
      </div>

      {/* Signals table */}
      <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#8A8F9E', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px' }}>Asset / Coin</th>
                <th style={{ padding: '16px' }}>Signal Action</th>
                <th style={{ padding: '16px' }}>Confidence Score</th>
                <th style={{ padding: '16px' }}>Entry Trigger</th>
                <th style={{ padding: '16px' }}>Target Margin</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Stop Loss</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((sig, idx) => {
                const isBuy = sig.signal === 'BUY';
                const isSell = sig.signal === 'SELL';
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#fff'
                        }}>
                          {sig.coin.slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 800, color: '#fff', fontSize: '14px' }}>{sig.coin}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontSize: '11px',
                        backgroundColor: isBuy ? 'rgba(76,175,80,0.1)' : isSell ? 'rgba(244,67,54,0.1)' : 'rgba(255,193,7,0.1)',
                        color: isBuy ? '#4CAF50' : isSell ? '#F44336' : '#FFC107'
                      }}>{sig.signal}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '80px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${sig.confidence * 100}%`, height: '100%', backgroundColor: isBuy ? '#4CAF50' : isSell ? '#F44336' : '#FFC107' }} />
                        </div>
                        <span style={{ fontWeight: 700 }}>{ (sig.confidence * 100).toFixed(0) }%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600, color: '#fff' }}>${sig.entry.toLocaleString()}</td>
                    <td style={{ padding: '16px', fontWeight: 600, color: '#4CAF50' }}>${sig.target.toLocaleString()}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#F44336' }}>
                      ${sig.stop_loss.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alpha Risk Disclosures Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        border: '1px dashed var(--border-color)',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.01)',
        textAlign: 'left'
      }}>
        <AlertTriangle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <h4 style={{ fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Risk Advisory & Leverage Caution</h4>
          <p>
            Signal targets are generated using localized node clustering features. Market volatility can override models predictions. Users are strongly recommended to utilize strict Stop Losses and limit portfolio size exposures.
          </p>
        </div>
      </div>

    </div>
  );
}
