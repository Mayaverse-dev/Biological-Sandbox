import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { CAT_COLORS } from '../utils/constants';

export default function SynthesisView({ 
  synthesis, 
  loading,
  error,
  onBack
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!synthesis) return;
    
    const text = `${synthesis.name}

BODY:
${synthesis.body}

INTEGRATED MECHANISM:
${synthesis.mechanism}

COMPOUNDING CONSTRAINTS:
${synthesis.constraints}

NARRATIVE POTENTIAL:
${synthesis.narrative}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="synthesis-view">
        <div className="synthesis-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
        <div className="synthesis-loading">
          <div className="spinner"></div>
          <p>Synthesizing hybrid species...</p>
          <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            Combining mechanisms and modeling biological plausibility
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="synthesis-view">
        <div className="synthesis-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
        <div className="synthesis-error">
          <div className="icon">⚠️</div>
          <h3>Synthesis Failed</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!synthesis) {
    return (
      <div className="synthesis-view">
        <div className="synthesis-header">
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
        <div className="synthesis-error">
          <div className="icon">🧬</div>
          <h3>No Synthesis Data</h3>
          <p>Something went wrong. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="synthesis-view">
      <div className="synthesis-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Browse
        </button>
        <div className="synthesis-actions">
          <button 
            className={`icon-btn-minimal ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? <Check size={18} strokeWidth={1.5} /> : <Copy size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
      
      {synthesis.mechanisms && synthesis.mechanisms.length > 0 && (
        <div className="synthesis-mechanisms-used">
          <h4>Mechanisms Combined</h4>
          <div className="mechanisms-badges">
            {synthesis.mechanisms.map(m => {
              const color = CAT_COLORS[m.cat] || 'var(--accent)';
              return (
                <div 
                  key={m.id} 
                  className="mechanism-badge"
                  style={{ borderColor: color }}
                >
                  <span className="badge-icon">{m.icon}</span>
                  <span className="badge-name" style={{ color }}>{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="synthesis-result-content">
        <h2>{synthesis.name}</h2>
        
        <div className="synthesis-section morphology">
          <div className="section-label">Morphology</div>
          <p>{synthesis.body}</p>
        </div>
        
        <div className="synthesis-section mechanism">
          <div className="section-label">Integrated Mechanism</div>
          <p>{synthesis.mechanism}</p>
        </div>
        
        <div className="synthesis-section constraints">
          <div className="section-label">Compounding Constraints</div>
          <p>{synthesis.constraints}</p>
        </div>
        
        <div className="synthesis-section narrative">
          <div className="section-label">Narrative Potential</div>
          <p>{synthesis.narrative}</p>
        </div>
      </div>
    </div>
  );
}
