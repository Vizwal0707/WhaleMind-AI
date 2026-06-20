'use client';

import React, { useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Handle,
  Position,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchFromAPI } from '../lib/api';
import { Compass, Users, Activity, TrendingUp, Info } from 'lucide-react';

// ----------------------------------------------------
// CUSTOM NODE COMPONENT FOR REACT FLOW
// ----------------------------------------------------
const CustomNode = ({ data }: NodeProps) => {
  const isBullish = data.prediction === 'BULLISH';
  const isBearish = data.prediction === 'BEARISH';
  
  return (
    <div 
      className="glass-panel" 
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: '#151821',
        border: `1px solid ${isBullish ? '#4CAF50' : isBearish ? '#F44336' : 'rgba(255,255,255,0.08)'}`,
        width: '180px',
        textAlign: 'left',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        position: 'relative'
      }}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} style={{ background: '#718096' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#718096' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#718096' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#718096' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Label and Whale Score */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '120px'
          }}>{data.label}</span>
          <span style={{
            fontSize: '9px',
            padding: '2px 4px',
            borderRadius: '3px',
            backgroundColor: 'rgba(248, 68, 100, 0.1)',
            color: 'var(--primary)',
            fontWeight: 700
          }}>{data.whale_score}</span>
        </div>

        {/* Balance holdings valuation */}
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
          Holdings: ${(data.balance_usd / 1e6).toFixed(1)}M
        </span>

        {/* GNN prediction details */}
        <div style={{
          marginTop: '6px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '9px'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>GNN Bias</span>
          <span style={{
            color: isBullish ? '#4CAF50' : isBearish ? '#F44336' : '#FFC107',
            fontWeight: 700
          }}>{data.prediction}</span>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  customNode: CustomNode,
};

// ----------------------------------------------------
// MAIN TAB VIEW COMPONENT
// ----------------------------------------------------
export default function GraphTab() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGraph() {
      const res = await fetchFromAPI('/graph');
      setNodes(res.nodes || []);
      setEdges(res.edges || []);
      setSummary(res.summary);
      setLoading(false);
    }
    loadGraph();
  }, []);

  if (loading || !summary) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }} className="animate-fade-in">
      
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>On-Chain Transaction Network</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Interactive GNN-embedded graph mapping capital flows between major institutional wallets.
          </p>
        </div>
        
        {/* Network Stats Summary Badge */}
        <div className="glass-panel" style={{
          display: 'flex',
          gap: '20px',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>NODES: </span>
            <span style={{ fontWeight: 700, color: '#fff' }}>{summary.node_count}</span>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>TRANSFERS: </span>
            <span style={{ fontWeight: 700, color: '#fff' }}>{summary.edge_count}</span>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>HEAVY FLOWS: </span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{summary.heavy_transfers_count}</span>
          </div>
        </div>
      </div>

      {/* React Flow Viewport Container */}
      <div style={{
        flex: 1,
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#07080A'
      }}>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#1A1D26" gap={16} size={1} />
          <Controls style={{ backgroundColor: '#151821', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
          <MiniMap 
            nodeColor={(n) => {
              if (n.data?.prediction === 'BULLISH') return '#4CAF50';
              if (n.data?.prediction === 'BEARISH') return '#F44336';
              return '#1E293B';
            }}
            maskColor="rgba(0, 0, 0, 0.7)"
            style={{ backgroundColor: '#151821', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}
          />
        </ReactFlow>

        {/* Legend Overlay Card */}
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 10,
          textAlign: 'left'
        }}>
          <h4 style={{ fontWeight: 700, fontSize: '12px', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>Network Legend</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50', display: 'inline-block' }} />
            <span>Bullish GNN Bias Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F44336', display: 'inline-block' }} />
            <span>Bearish GNN Bias Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFC107', display: 'inline-block' }} />
            <span>Neutral GNN Bias Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
            <span style={{ width: '16px', height: '2px', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
            <span>Active Whale Transfer (&gt; $2M)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
