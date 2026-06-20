'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import OverviewTab from '@/components/OverviewTab';
import TrackerTab from '@/components/TrackerTab';
import GraphTab from '@/components/GraphTab';
import GnnTab from '@/components/GnnTab';
import AlphaTab from '@/components/AlphaTab';
import SignalsTab from '@/components/SignalsTab';
import BacktestTab from '@/components/BacktestTab';
import AlertsTab from '@/components/AlertsTab';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Side Navigation panel (Fixed width) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main scrolling viewport dashboard content */}
      <div style={{
        flex: 1,
        marginLeft: '260px',
        padding: '40px',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'tracker' && <TrackerTab />}
        {activeTab === 'graph' && <GraphTab />}
        {activeTab === 'gnn' && <GnnTab />}
        {activeTab === 'alpha' && <AlphaTab />}
        {activeTab === 'signals' && <SignalsTab />}
        {activeTab === 'backtest' && <BacktestTab />}
        {activeTab === 'alerts' && <AlertsTab />}
      </div>
    </div>
  );
}
