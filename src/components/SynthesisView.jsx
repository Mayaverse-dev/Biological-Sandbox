import { useState } from 'react';
import { Copy, Check, Save, RefreshCw } from 'lucide-react';
import { CAT_COLORS } from '../utils/constants';

function StatBars({ stats, color }) {
  if (!stats) return null;
  
  const entries = Object.entries(stats);
  
  return (
    <div className="stat-bars">
      {entries.map(([k, v]) => (
        <div className="stat-row" key={k}>
          <div className="stat-label">{k}</div>
          <div className="stat-track">
            <div className="stat-fill" style={{ width: `${v}%`, background: color }} />
          </div>
          <div className="stat-val">{v}</div>
        </div>
      ))}
    </div>
  );
}

export default function SynthesisView({ 
  synthesis, 
  loading,
  error,
  onBack,
  onSave,
  onRegenerate,
  saving,
  saved
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!synthesis) return;
    
    const text = `${synthesis.name}

WHAT IT DOES:
${synthesis.what}

HOW IT WORKS:
${synthesis.how}

CONSTRAINTS & TRADEOFFS:
${synthesis.constraints}

COMBINATORIAL NOTES:
${synthesis.combo}

NARRATIVE HOOKS:
${synthesis.hooks}

STATS:
Resilience: ${synthesis.stats?.resilience || 0}
Offense: ${synthesis.stats?.offense || 0}
Regen: ${synthesis.stats?.regen || 0}
Complexity: ${synthesis.stats?.complexity || 0}
Social: ${synthesis.stats?.social || 0}

TAGS: ${synthesis.tags?.join(', ') || 'none'}`;

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
      
      {synthesis.parents && synthesis.parents.length > 0 && (
        <div className="synthesis-mechanisms-used">
          <h4>Created From</h4>
          <div className="mechanisms-badges">
            {synthesis.parents.map(p => {
              const color = CAT_COLORS[p.category] || 'var(--accent)';
              return (
                <div 
                  key={p.id} 
                  className="mechanism-badge"
                  style={{ borderColor: color }}
                >
                  <span className="badge-icon">{p.icon}</span>
                  <span className="badge-name" style={{ color }}>{p.name}</span>
                  {p.is_synthesized && (
                    <span className="badge-gen">Gen {p.generation}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="synthesis-result-content">
        <div className="synthesis-title-row">
          <h2>{synthesis.name}</h2>
          {synthesis.generation && (
            <span className="gen-badge-inline">Gen {synthesis.generation}</span>
          )}
        </div>
        
        <div className="synthesis-section">
          <div className="section-label">What It Does</div>
          <p>{synthesis.what}</p>
        </div>
        
        <div className="synthesis-section mechanism">
          <div className="section-label">How It Works</div>
          <p>{synthesis.how}</p>
        </div>
        
        <div className="synthesis-section constraints">
          <div className="section-label">Constraints & Tradeoffs</div>
          <p>{synthesis.constraints}</p>
        </div>
        
        <div className="synthesis-section">
          <div className="section-label">Combinatorial Notes</div>
          <p>{synthesis.combo}</p>
        </div>
        
        <div className="synthesis-section narrative">
          <div className="section-label">Narrative Hooks</div>
          <p>{synthesis.hooks}</p>
        </div>

        {synthesis.tags && synthesis.tags.length > 0 && (
          <div className="synthesis-section">
            <div className="section-label">Tags</div>
            <div className="tags-row">
              {synthesis.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {synthesis.stats && (
          <div className="synthesis-section">
            <div className="section-label">Functional Attributes</div>
            <StatBars stats={synthesis.stats} color="var(--accent)" />
          </div>
        )}
      </div>

      <div className="synthesis-footer">
        {saved ? (
          <button className="btn btn-success" disabled>
            <Check size={16} /> Species Saved
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={onSave}
            disabled={saving}
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <><Save size={16} /> Save Species</>
            )}
          </button>
        )}
        <button 
          className="btn btn-secondary" 
          onClick={onRegenerate}
          disabled={loading || saving}
        >
          <RefreshCw size={16} /> Regenerate
        </button>
      </div>
    </div>
  );
}
