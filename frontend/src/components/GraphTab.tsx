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
import { Compass, Users, Activity, TrendingUp, Info, X, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
  const [originalNodes, setOriginalNodes] = useState<any[]>([]);
  const [originalEdges, setOriginalEdges] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [minFlowAmount, setMinFlowAmount] = useState(0);

  // Drawer detail state
  const [selectedNodeAddress, setSelectedNodeAddress] = useState<string | null>(null);
  const [nodeDetail, setNodeDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function loadGraph() {
      const res = await fetchFromAPI('/graph');
      setOriginalNodes(res.nodes || []);
      setOriginalEdges(res.edges || []);
      setSummary(res.summary);
      setLoading(false);
    }
    loadGraph();
  }, []);

  const onNodeClick = async (event: React.MouseEvent, node: any) => {
    setSelectedNodeAddress(node.id);
    setDetailLoading(true);
    const detail = await fetchFromAPI(`/whales/${node.id}`);
    setNodeDetail(detail);
    setDetailLoading(false);
  };

  if (loading || !summary) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  // 1. Filter edges by transaction volume
  const filteredEdges = originalEdges.filter(e => {
    const val = e.data?.amount_usd || 0;
    return val >= minFlowAmount;
  });

  // 2. Adjust node styles (opacity) based on search highlight query
  const processedNodes = originalNodes.map(node => {
    const query = searchQuery.trim().toLowerCase();
    const isMatched = !query || 
      node.id.toLowerCase().includes(query) ||
      (node.data?.label && node.data.label.toLowerCase().includes(query));
    
    return {
      ...node,
      style: {
        ...node.style,
        opacity: isMatched ? 1.0 : 0.25,
        transition: 'opacity 0.25s ease'
      }
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 120px)' }} className="animate-fade-in">
      
      {/* Page Title & Filter Headers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', textAlign: 'left' }}>
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

      {/* Search and Threshold Controls Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        width: '100%',
        textAlign: 'left'
      }}>
        {/* Search focus */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            placeholder="Search & highlight node..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 16px 8px 36px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>

        {/* Transaction Flow Threshold Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Flow Threshold:</span>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            {[
              { label: 'All', value: 0 },
              { label: '>$500k', value: 500000 },
              { label: '>$2M', value: 2000000 },
              { label: '>$5M', value: 5000000 }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMinFlowAmount(opt.value)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: minFlowAmount === opt.value ? 'var(--primary)' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Graph & Detail Drawer Section */}
      <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
        
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
            nodes={processedNodes}
            edges={filteredEdges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
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

        {/* Selected Node Details Drawer */}
        {selectedNodeAddress && (
          <aside className="glass-panel animate-fade-in" style={{
            width: '380px',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto',
            textAlign: 'left'
          }}>
            {/* Close Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>NODE INSPECTOR</span>
              <button 
                onClick={() => setSelectedNodeAddress(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading || !nodeDetail ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40%' }}>
                <div className="spinner" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                    {nodeDetail.wallet_details.label || 'Unknown Whale'}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block', wordBreak: 'break-all', marginTop: '4px' }}>
                    {nodeDetail.wallet_details.address}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Holdings Valuation</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>${(nodeDetail.wallet_details.balance_usd / 1e6).toFixed(2)}M</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Whale Score Index</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{nodeDetail.wallet_details.whale_score} / 100</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Influence Score</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{nodeDetail.wallet_details.influence_score} / 100</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: '#fff' }}>Recent Node Transfers</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {nodeDetail.recent_transactions.slice(0, 8).map((tx: any, idx: number) => {
                      const isOutgoing = tx.from_address.toLowerCase() === selectedNodeAddress.toLowerCase();
                      return (
                        <div 
                          key={idx}
                          style={{
                            padding: '10px',
                            backgroundColor: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.03)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '11px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: isOutgoing ? 'rgba(244,67,54,0.1)' : 'rgba(76,175,80,0.1)',
                              color: isOutgoing ? '#F44336' : '#4CAF50',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {isOutgoing ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                            </div>
                            <div>
                              <span style={{ fontWeight: 700, color: '#fff' }}>{isOutgoing ? 'SEND' : 'RECEIVE'}</span>
                              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '9px' }}>
                                {tx.hash.slice(0, 10)}
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

    </div>
  );
}
