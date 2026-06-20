'use client';

import React, { useEffect, useState } from 'react';
import { fetchFromAPI } from '../lib/api';
import { Award, Compass, TrendingUp, Info } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AlphaTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await fetchFromAPI('/backtest/alpha');
      setData(res);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const { alpha_factors, correlation_analysis, feature_importance } = data;

  const getHeatmapColor = (val: number) => {
    if (val === 1.0) return 'rgba(248, 68, 100, 0.4)';
    if (val > 0.5) return 'rgba(76, 175, 80, 0.3)';
    if (val > 0.2) return 'rgba(76, 175, 80, 0.15)';
    if (val < -0.5) return 'rgba(244, 67, 54, 0.3)';
    if (val < -0.2) return 'rgba(244, 67, 54, 0.15)';
    return 'rgba(255, 255, 255, 0.02)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="animate-fade-in">
      
      {/* Page Title */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>Alpha Factor Library</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Evaluate predictive power weights and correlation coefficients for on-chain crypto metrics.
        </p>
      </div>

      {/* Alpha Factors Table */}
      <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#8A8F9E', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px' }}>Alpha Factor Name</th>
                <th style={{ padding: '16px' }}>Predictive Power (Information Coefficient)</th>
                <th style={{ padding: '16px' }}>Correlation to Price</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Active Signal Status</th>
              </tr>
            </thead>
            <tbody>
              {alpha_factors.map((factor: any, idx: number) => {
                const isBullish = factor.status.includes('Bullish');
                const isBearish = factor.status.includes('Bearish');
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '16px', fontWeight: 700, color: '#fff' }}>{factor.factor_name}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '100px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${(factor.predictive_power ?? factor.importance_score ?? 0.0) * 100}%`, height: '100%', backgroundColor: 'var(--primary)' }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{(factor.predictive_power ?? factor.importance_score ?? 0.0).toFixed(2)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600, color: factor.correlation_to_price >= 0 ? '#4CAF50' : '#F44336' }}>
                      {factor.correlation_to_price >= 0 ? '+' : ''}{factor.correlation_to_price.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isBullish ? 'rgba(76,175,80,0.1)' : isBearish ? 'rgba(244,67,54,0.1)' : 'rgba(255,255,255,0.04)',
                        color: isBullish ? '#4CAF50' : isBearish ? '#F44336' : '#fff'
                      }}>{factor.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Double Column Chart Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '30px',
        width: '100%'
      }}>
        
        {/* Chart 1: Feature Importance */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Relative Feature Importance (XGBoost)</h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feature_importance} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#646A7E" style={{ fontSize: '12px' }} />
                <YAxis dataKey="factor" type="category" stroke="#646A7E" style={{ fontSize: '11px' }} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151821', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="importance" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap: Correlation Analysis */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Alpha Correlation Matrix</h3>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              
              {/* Header row */}
              <div style={{ display: 'flex', gap: '4px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, paddingBottom: '6px' }}>
                <div style={{ flex: 1, minWidth: '100px' }} />
                {correlation_analysis.labels.map((lbl: string, idx: number) => (
                  <div key={idx} style={{ flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lbl.split(' ')[0]}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {correlation_analysis.matrix.map((row: number[], rIdx: number) => (
                <div key={rIdx} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {/* Left Label */}
                  <div style={{ flex: 1, minWidth: '100px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'left' }}>
                    {correlation_analysis.labels[rIdx]}
                  </div>
                  {/* Matrix Cells */}
                  {row.map((val: number, cIdx: number) => (
                    <div 
                      key={cIdx} 
                      style={{
                        flex: 1,
                        padding: '10px 4px',
                        backgroundColor: getHeatmapColor(val),
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textAlign: 'center',
                        color: val === 1.0 ? '#fff' : val >= 0 ? '#4CAF50' : '#F44336',
                        border: '1px solid rgba(255,255,255,0.02)'
                      }}
                      title={`${correlation_analysis.labels[rIdx]} vs ${correlation_analysis.labels[cIdx]}: ${val}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))}
                </div>
              ))}

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
