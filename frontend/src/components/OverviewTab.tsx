'use client';

import React, { useEffect, useState } from 'react';
import { fetchFromAPI } from '../lib/api';
import StatCard from './StatCard';
import { 
  Coins, 
  Users, 
  TrendingUp, 
  Activity, 
  HelpCircle, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';

export default function OverviewTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await fetchFromAPI('/overview');
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

  const { market_stats, prices_chart, portfolio_performance } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="animate-fade-in">
      {/* Page Title */}
      <div style={{ textAlign: 'left' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>Crypto Intelligence Overview</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Real-time institutional on-chain metrics, GNN predictions, and whale distribution trackers.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px',
        width: '100%'
      }}>
        <StatCard 
          title="BTC Price"
          value={`$${market_stats.btc_price.toLocaleString()}`}
          change="+1.45%"
          isPositive={true}
          icon={Coins}
        />
        <StatCard 
          title="ETH Price"
          value={`$${market_stats.eth_price.toLocaleString()}`}
          change="-0.82%"
          isPositive={false}
          icon={Coins}
        />
        <StatCard 
          title="Tracked Whales"
          value={market_stats.whale_count}
          change="+3 new today"
          isPositive={true}
          icon={Users}
        />
        <StatCard 
          title="Active Alpha Factors"
          value={market_stats.active_signals}
          subtitle="GNN Signal: BULLISH"
          icon={TrendingUp}
        />
      </div>

      {/* Double Column Chart Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '30px',
        width: '100%'
      }}>
        
        {/* Chart 1: BTC/ETH Comparison */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Market Price Index</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prices_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#646A7E" style={{ fontSize: '12px' }} />
                <YAxis stroke="#646A7E" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151821', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Line type="monotone" dataKey="BTC" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="ETH" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Portfolio Performance vs Benchmark */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
            WhaleMind Portfolio Alpha
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolio_performance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A5568" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4A5568" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="timestamp" stroke="#646A7E" style={{ fontSize: '11px' }} />
                <YAxis stroke="#646A7E" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151821', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Area type="monotone" name="WhaleMind Model" dataKey="portfolio_value" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorPort)" />
                <Area type="monotone" name="Benchmark (BTC HODL)" dataKey="btc_value" stroke="#718096" strokeWidth={2} fillOpacity={1} fill="url(#colorBtc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Analytics Insights Banner */}
      <div className="glass-panel" style={{
        padding: '20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(76,175,80,0.1)',
            color: '#4CAF50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Signal Alert: Large Whale Accumulation Spotted</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Jump Crypto accumulated over $45M in BTC and ETH during the last 24-hour cycle. GNN confidence increased to 81%.
            </p>
          </div>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Inspect Wallet Activity</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

    </div>
  );
}
