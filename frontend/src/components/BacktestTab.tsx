'use client';

import React, { useEffect, useState } from 'react';
import { fetchFromAPI } from '../lib/api';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, TrendingUp, BarChart3, RotateCw } from 'lucide-react';

export default function BacktestTab() {
  const [strategy, setStrategy] = useState('Combined Alpha Strategy');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runBacktest() {
      setLoading(true);
      const res = await fetchFromAPI(`/backtest/run?strategy=${encodeURIComponent(strategy)}`);
      setData(res);
      setLoading(false);
    }
    runBacktest();
  }, [strategy]);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const { strategy_name, metrics, monthly_returns, equity_curve } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="animate-fade-in">
      
      {/* Page Title & Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', textAlign: 'left' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>Backtester Terminal</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Simulate historical strategy returns, verify drawdown curves, and view risk-adjusted metric profiles.
          </p>
        </div>

        {/* Strategy Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Strategy Model:</label>
          <select 
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Whale Following">Whale Following Strategy</option>
            <option value="GNN Prediction Strategy">GNN Prediction Model</option>
            <option value="Combined Alpha Strategy">Combined Alpha Factor System</option>
          </select>
        </div>
      </div>

      {/* Metrics Performance Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '20px',
        width: '100%'
      }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>STRATEGY CAGR</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '6px' }}>
            { (metrics.cagr * 100).toFixed(1) }%
          </h3>
          <span style={{ fontSize: '10px', color: '#646A7E', marginTop: '4px', display: 'block' }}>Benchmark: { (metrics.benchmark_cagr * 100).toFixed(1) }%</span>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SHARPE RATIO</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            { metrics.sharpe_ratio.toFixed(2) }
          </h3>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SORTINO RATIO</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            { metrics.sortino_ratio.toFixed(2) }
          </h3>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>MAX DRAWDOWN</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#F44336', marginTop: '6px' }}>
            -{ (metrics.max_drawdown * 100).toFixed(1) }%
          </h3>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>WIN RATE</span>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#4CAF50', marginTop: '6px' }}>
            { (metrics.win_rate * 100).toFixed(1) }%
          </h3>
        </div>
      </div>

      {/* Double Column Chart Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '30px',
        width: '100%'
      }}>
        
        {/* Chart 1: Equity Curve */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Simulated Growth of Equity ($100k Base)</h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equity_curve} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" name="Day" stroke="#646A7E" style={{ fontSize: '12px' }} />
                <YAxis stroke="#646A7E" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151821', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" name="Portfolio Value" dataKey="balance" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Returns */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Strategy Monthly Distributions</h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_returns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#646A7E" style={{ fontSize: '12px' }} />
                <YAxis stroke="#646A7E" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151821', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="return_pct" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
