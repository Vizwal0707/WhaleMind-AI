import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  isPositive?: boolean;
  icon?: React.ComponentType<any>;
  subtitle?: string;
}

export default function StatCard({ title, value, change, isPositive = true, icon: Icon, subtitle }: StatCardProps) {
  return (
    <div 
      className="glass-panel" 
      style={{
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: 'rgba(21, 24, 33, 0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        textAlign: 'left',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        flex: 1,
        minWidth: '220px'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#8A8F9E',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>{title}</span>
        {Icon && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A0AEC0'
          }}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '10px'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'sans-serif',
          margin: 0
        }}>{value}</h2>
        
        {change && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: 700,
            color: isPositive ? '#4CAF50' : '#F44336',
            backgroundColor: isPositive ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <span style={{
          fontSize: '11px',
          color: '#646A7E',
          fontWeight: 500
        }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
