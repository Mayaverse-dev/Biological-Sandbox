import { useState } from 'react';

export default function HybridResult({ result, error, loading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    
    const text = `${result.name}

BODY:
${result.body}

INTEGRATED MECHANISM:
${result.mechanism}

COMPOUNDING CONSTRAINTS:
${result.constraints}

NARRATIVE POTENTIAL:
${result.narrative}`;

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
      <div className="hybrid-result">
        <span className="hybrid-label">Generating hybrid…</span>
        <div className="hybrid-body" style={{ color: 'var(--text-faint)' }}>
          Combining mechanisms and modeling biological plausibility…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hybrid-result">
        <span className="hybrid-label" style={{ color: 'var(--red)' }}>
          Synthesis Error
        </span>
        <div className="hybrid-body" style={{ color: 'var(--text-faint)' }}>
          {error}. Try a different combination.
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="hybrid-result">
      <div className="hybrid-result-header">
        <span className="hybrid-label">Synthesized Species</span>
        <button 
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      
      <h4>{result.name.trim()}</h4>
      
      <div className="hybrid-body" style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ 
            fontSize: 9, 
            fontFamily: "'DM Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--text-faint)',
            marginBottom: 4
          }}>
            Morphology
          </div>
          <div>{result.body.trim()}</div>
        </div>
        
        <div style={{ marginBottom: 12 }}>
          <div style={{ 
            fontSize: 9, 
            fontFamily: "'DM Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--accent)',
            marginBottom: 4
          }}>
            Integrated Mechanism
          </div>
          <div>{result.mechanism.trim()}</div>
        </div>
        
        <div style={{ marginBottom: 12 }}>
          <div style={{ 
            fontSize: 9, 
            fontFamily: "'DM Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--amber)',
            marginBottom: 4
          }}>
            Compounding Constraints
          </div>
          <div style={{ color: 'var(--amber)' }}>{result.constraints.trim()}</div>
        </div>
        
        <div>
          <div style={{ 
            fontSize: 9, 
            fontFamily: "'DM Mono', monospace",
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--violet)',
            marginBottom: 4
          }}>
            Narrative Potential
          </div>
          <div style={{ color: 'var(--violet)', fontStyle: 'italic' }}>
            {result.narrative.trim()}
          </div>
        </div>
      </div>
    </div>
  );
}
