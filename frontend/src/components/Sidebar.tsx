'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Network, 
  BrainCircuit, 
  TrendingUp, 
  LineChart, 
  BarChart3, 
  BellRing, 
  ShieldCheck,
  FileText
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'tracker', name: 'Whale Tracker', icon: Search },
    { id: 'graph', name: 'Blockchain Graph', icon: Network },
    { id: 'gnn', name: 'GNN Analytics', icon: BrainCircuit },
    { id: 'alpha', name: 'Alpha Factors', icon: TrendingUp },
    { id: 'signals', name: 'Trading Signals', icon: LineChart },
    { id: 'backtest', name: 'Backtest Results', icon: BarChart3 },
    { id: 'alerts', name: 'Alert Center', icon: BellRing },
    { id: 'report', name: 'Performance Report', icon: FileText },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#0C0D12',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 40,
      userSelect: 'none'
    }}>
      {/* Brand Logo Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          backgroundColor: 'var(--primary, #F84464)',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 0 15px rgba(248, 68, 100, 0.4)'
        }}>
          <BrainCircuit size={18} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#fff',
            fontFamily: 'sans-serif',
            letterSpacing: '0.5px'
          }}>
            Whale<span style={{ color: 'var(--primary, #F84464)' }}>Mind</span>
          </span>
          <span style={{
            fontSize: '10px',
            color: '#646A7E',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginTop: '2px'
          }}>
            AI Quant Platform
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{
        flex: 1,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        overflowY: 'auto'
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'left',
                transition: 'all 0.2s ease',
                
                backgroundColor: isActive ? 'rgba(248, 68, 100, 0.1)' : 'transparent',
                color: isActive ? 'var(--primary, #F84464)' : '#9FA4B4',
                boxShadow: isActive ? 'inset 0 0 10px rgba(248, 68, 100, 0.05)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#9FA4B4';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--primary, #F84464)' : 'inherit' }} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile Status */}
      <div style={{
        padding: '20px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textAlign: 'left'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#1E2235',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4CAF50'
        }}>
          <ShieldCheck size={16} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Quant Engine</span>
          <span style={{ fontSize: '10px', color: '#4CAF50', fontWeight: 600 }}>SYSTEMS ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
