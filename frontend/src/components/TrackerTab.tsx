'use client';

import React, { useEffect, useState } from 'react';
import { fetchFromAPI } from '../lib/api';
import { Search, ChevronRight, X, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

export default function TrackerTab() {
  const [whales, setWhales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWhaleAddress, setSelectedWhaleAddress] = useState<string | null>(null);
  const [whaleDetail, setWhaleDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function loadWhales() {
      const data = await fetchFromAPI('/whales');
      setWhales(data);
      setLoading(false);
    }
    loadWhales();
  }, []);

  const handleWhaleClick = async (address: string) => {
    setSelectedWhaleAddress(address);
    setDetailLoading(true);
    const detail = await fetchFromAPI(`/whales/${address}`);
    setWhaleDetail(detail);
    setDetailLoading(false);
  };

  const filteredWhales = whales.filter(w => 
    w.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.label && w.label.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', position: 'relative' }} className="animate-fade-in">
      
      {/* Left panel: Whales Grid/List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Page Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', textAlign: 'left' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>Whale Tracker Index</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Filter and analyze wallets holding massive amounts of assets and influencing on-chain liquidity.
            </p>
          </div>
        </div>

        {/* Filters and search box */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          width: '100%',
          position: 'relative'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search by label or wallet address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 38px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                color: '#fff'
              }}
            />
          </div>
        </div>

        {/* Whales Table */}
        <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#8A8F9E' }}>
                  <th style={{ padding: '16px' }}>Label / Address</th>
                  <th style={{ padding: '16px' }}>Whale Score</th>
                  <th style={{ padding: '16px' }}>Influence</th>
                  <th style={{ padding: '16px' }}>Accumulation Score</th>
                  <th style={{ padding: '16px' }}>24h Net Flow</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Total Holdings</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : filteredWhales.map((whale, idx) => (
                  <tr 
                    key={idx}
                    onClick={() => handleWhaleClick(whale.address)}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      backgroundColor: selectedWhaleAddress === whale.address ? 'rgba(248, 68, 100, 0.05)' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedWhaleAddress === whale.address ? 'rgba(248, 68, 100, 0.05)' : 'transparent'}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{whale.label || 'Unknown Whale'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                          {whale.address.slice(0, 10)}...{whale.address.slice(-8)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(248, 68, 100, 0.1)',
                        color: 'var(--primary)',
                        fontWeight: 700
                      }}>{whale.whale_score}</span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>{whale.influence_score} / 100</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ flex: 1, minWidth: '60px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${whale.accumulation_score}%`, height: '100%', backgroundColor: '#4CAF50' }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{whale.accumulation_score}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        color: whale.net_flow_24h >= 0 ? '#4CAF50' : '#F44336',
                        fontWeight: 600
                      }}>
                        {whale.net_flow_24h >= 0 ? '+' : ''}${ (whale.net_flow_24h / 1e6).toFixed(2) }M
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                      ${ (whale.balance_usd / 1e6).toFixed(1) }M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right panel: Detail Drawer Overlay */}
      {selectedWhaleAddress && (
        <aside className="glass-panel animate-fade-in" style={{
          width: '420px',
          borderRadius: '12px',
          padding: '24px',
          position: 'sticky',
          top: '20px',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          flexShrink: 0,
          textAlign: 'left'
        }}>
          {/* Close Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>WHALE ANALYSIS FILE</span>
            <button 
              onClick={() => setSelectedWhaleAddress(null)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {detailLoading || !whaleDetail ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30vh' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header profile */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                  {whaleDetail.wallet_details.label || 'Unknown Whale'}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block', wordBreak: 'break-all', marginTop: '4px' }}>
                  {whaleDetail.wallet_details.address}
                </span>
              </div>

              {/* KPI Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Holdings Valuation</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>${(whaleDetail.wallet_details.balance_usd / 1e6).toFixed(2)}M</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Whale Score Index</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{whaleDetail.wallet_details.whale_score} / 100</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Network Influence</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{whaleDetail.wallet_details.influence_score} / 100</span>
                </div>
              </div>

              {/* Transaction history section */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>Recent Transactions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {whaleDetail.recent_transactions.map((tx: any, idx: number) => {
                    const isOutgoing = tx.from_address.toLowerCase() === selectedWhaleAddress.toLowerCase();
                    return (
                      <div 
                        key={idx}
                        style={{
                          padding: '12px',
                          backgroundColor: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: isOutgoing ? 'rgba(244,67,54,0.1)' : 'rgba(76,175,80,0.1)',
                            color: isOutgoing ? '#F44336' : '#4CAF50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {isOutgoing ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#fff' }}>{isOutgoing ? 'SEND' : 'RECEIVE'} {tx.token}</span>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', marginTop: '2px' }}>
                              Tx: {tx.hash.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, color: isOutgoing ? '#F44336' : '#4CAF50' }}>
                          {isOutgoing ? '-' : '+'}${(tx.amount_usd / 1e6).toFixed(2)}M
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </aside>
      )}

    </div>
  );
}
