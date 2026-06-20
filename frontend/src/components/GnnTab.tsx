'use client';

import React, { useEffect, useState } from 'react';
import { fetchFromAPI, triggerRetrainingAPI } from '../lib/api';
import { Brain, Cpu, Play, CheckCircle } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function GnnTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      const res = await fetchFromAPI('/gnn');
      setData(res);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainSuccess(false);
    
    // Simulate 2.5s training latency
    setTimeout(async () => {
      const res = await triggerRetrainingAPI();
      
      // Reload updated GNN data
      const updatedData = await fetchFromAPI('/gnn');
      setData(updatedData);
      
      setIsRetraining(false);
      setRetrainSuccess(true);
    }, 2500);
  };

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const { model_metadata, performance_metrics, training_curves, confusion_matrix } = data;

  // Re-map Recharts lines
  const chartData = training_curves.epochs.map((epoch: number, idx: number) => ({
    epoch,
    train_loss: training_curves.train_loss[idx],
    val_loss: training_curves.val_loss[idx]
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }} className="animate-fade-in">
      
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', textAlign: 'left' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>GNN Engine Analytics</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Inspect structural GNN node classification accuracy, loss limits, and trigger network models retraining.
          </p>
        </div>
        
        {/* Retrain Action CTA */}
        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="btn btn-primary glow-hover"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isRetraining ? (
            <>
              <div className="spinner" style={{ width: '14px', height: '14px' }} />
              <span>Training Node Embeddings...</span>
            </>
          ) : (
            <>
              <Play size={14} fill="#fff" />
              <span>Retrain GNN Model</span>
            </>
          )}
        </button>
      </div>

      {/* Retrain success banner */}
      {retrainSuccess && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(76,175,80,0.1)',
          border: '1px solid #4CAF50',
          borderRadius: '8px',
          color: '#4CAF50',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textAlign: 'left'
        }}>
          <CheckCircle size={16} />
          <span>GNN training completed successfully. Model accuracy optimized to { (performance_metrics.accuracy * 100).toFixed(1) }%.</span>
        </div>
      )}

      {/* Stats Summary Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
        width: '100%'
      }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>CLASSIFIER ACCURACY</span>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)', marginTop: '6px' }}>
            { (performance_metrics.accuracy * 100).toFixed(1) }%
          </h3>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>F1 SCORE</span>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#3B82F6', marginTop: '6px' }}>
            { (performance_metrics.f1_score).toFixed(3) }
          </h3>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PRECISION</span>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            { (performance_metrics.precision).toFixed(3) }
          </h3>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>RECALL RATIO</span>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
            { (performance_metrics.recall).toFixed(3) }
          </h3>
        </div>
      </div>

      {/* Loss Curves & Confusion Matrix Grids */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px',
        width: '100%'
      }}>
        
        {/* Loss curves graph */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Loss Curves</h3>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="epoch" name="Epoch" stroke="#646A7E" style={{ fontSize: '12px' }} />
                <YAxis stroke="#646A7E" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151821', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                <Line type="monotone" name="Train Loss" dataKey="train_loss" stroke="var(--primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" name="Validation Loss" dataKey="val_loss" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion matrix */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Node Classification Confusion Matrix</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
            <thead>
              <tr style={{ color: '#8A8F9E', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actual \ Predicted</th>
                <th style={{ padding: '12px' }}>Bearish</th>
                <th style={{ padding: '12px' }}>Neutral</th>
                <th style={{ padding: '12px' }}>Bullish</th>
              </tr>
            </thead>
            <tbody>
              {confusion_matrix.map((row: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '16px', fontWeight: 700, color: '#fff', textAlign: 'left' }}>{row.actual}</td>
                  <td style={{ padding: '16px', backgroundColor: idx === 0 ? 'rgba(248,68,100,0.1)' : 'transparent', fontWeight: idx === 0 ? 700 : 500 }}>
                    {row.predicted_bearish}
                  </td>
                  <td style={{ padding: '16px', backgroundColor: idx === 1 ? 'rgba(59,130,246,0.1)' : 'transparent', fontWeight: idx === 1 ? 700 : 500 }}>
                    {row.predicted_neutral}
                  </td>
                  <td style={{ padding: '16px', backgroundColor: idx === 2 ? 'rgba(76,175,80,0.1)' : 'transparent', fontWeight: idx === 2 ? 700 : 500 }}>
                    {row.predicted_bullish}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
