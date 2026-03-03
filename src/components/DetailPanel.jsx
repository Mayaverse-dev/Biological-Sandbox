import { Plus, Loader2 } from 'lucide-react';
import { CAT_COLORS } from '../utils/constants';
import EmptyState from './EmptyState';

function StatBars({ stats, color }) {
  if (!stats) return null;
  
  const entries = typeof stats === 'string' ? Object.entries(JSON.parse(stats)) : Object.entries(stats);
  
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

function LineageSection({ parents, loading, onSelectParent }) {
  // Show loading state while fetching lineage
  if (loading) {
    return (
      <div className="detail-section lineage-section">
        <div className="section-label">Created From</div>
        <div className="lineage-loading">
          <Loader2 size={14} className="spin" />
          <span>Loading lineage...</span>
        </div>
      </div>
    );
  }

  if (!parents || parents.length === 0) return null;

  return (
    <div className="detail-section lineage-section">
      <div className="section-label">Created From</div>
      <div className="lineage-parents">
        {parents.map((parent, idx) => (
          <span key={parent.id}>
            <button
              className="lineage-link"
              onClick={() => onSelectParent(parent.id)}
            >
              {parent.icon} {parent.name}
            </button>
            {idx < parents.length - 1 && <span className="lineage-separator">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function UsedInSection({ children, loading, onSelect }) {
  if (loading) {
    return (
      <div className="detail-section">
        <div className="section-label">Used In</div>
        <div className="lineage-loading">
          <Loader2 size={14} className="spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!children || children.length === 0) return null;

  return (
    <div className="detail-section">
      <div className="section-label">Used In</div>
      <div className="lineage-parents">
        {children.map((child, idx) => (
          <span key={child.id}>
            <button
              className="lineage-link"
              onClick={() => onSelect(child.id)}
            >
              {child.icon} {child.name}
            </button>
            {idx < children.length - 1 && <span className="lineage-separator">,</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function BaseMechanismDetail({ species, color, lineageLoading, onEdit, onDelete, onTagClick, onAddToMixer, onSelect }) {
  return (
    <>
      <div className="detail-header">
        <div className="detail-header-top">
          <div 
            className="cat-badge" 
            style={{ 
              background: `${color}22`, 
              color: color, 
              border: `1px solid ${color}44` 
            }}
          >
            {species.category}
          </div>
          <div className="detail-header-actions">
            <button 
              className="detail-action-btn primary"
              onClick={() => onAddToMixer(species)}
            >
              <Plus size={14} /> Add to Mixer
            </button>
            <button className="detail-action-btn" onClick={() => onEdit(species)}>
              Edit
            </button>
            <button className="detail-action-btn delete" onClick={() => onDelete(species.id)}>
              Delete
            </button>
          </div>
        </div>
        <div className="detail-title-stack">
          <h2>{species.name}</h2>
          <div className="subtitle">{species.mech}</div>
          <div className="source">{species.source}</div>
        </div>
      </div>
      
      <div className="detail-body">
        <div className="detail-section">
          <div className="section-label">What It Does</div>
          <p>{species.what}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">How It Works</div>
          <p>{species.how}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">Constraints & Tradeoffs</div>
          <p className="constraint-text">{species.constraints_text}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">Combinatorial Notes</div>
          <p>{species.combo}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">Narrative Hooks</div>
          <p className="hook-text">{species.hooks}</p>
        </div>
        
        {species.tags && species.tags.length > 0 && (
          <div className="detail-section">
            <div className="section-label">Tags</div>
            <div className="tags-row">
              {species.tags.map(tag => (
                <span 
                  key={tag} 
                  className="tag"
                  onClick={() => onTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {species.stats && (
          <div className="detail-section">
            <div className="section-label">Functional Attributes</div>
            <StatBars stats={species.stats} color={color} />
          </div>
        )}

        <UsedInSection 
          children={species.children} 
          loading={lineageLoading} 
          onSelect={onSelect} 
        />
      </div>
    </>
  );
}

function SynthesizedSpeciesDetail({ species, lineageLoading, onEdit, onDelete, onTagClick, onAddToMixer, onSelectParent }) {
  const color = 'var(--accent)';

  return (
    <>
      <div className="detail-header">
        <div className="detail-header-top">
          <div className="detail-badges">
            <div 
              className="cat-badge" 
              style={{ 
                background: `${color}22`, 
                color: color, 
                border: `1px solid ${color}44` 
              }}
            >
              Synthesized
            </div>
            <div 
              className="gen-badge" 
              style={{ 
                background: 'var(--surface-2)', 
                color: 'var(--text-dim)', 
                border: '1px solid var(--border)' 
              }}
            >
              Gen {species.generation}
            </div>
          </div>
          <div className="detail-header-actions">
            <button 
              className="detail-action-btn primary"
              onClick={() => onAddToMixer(species)}
            >
              <Plus size={14} /> Add to Mixer
            </button>
            <button className="detail-action-btn delete" onClick={() => onDelete(species.id)}>
              Delete
            </button>
          </div>
        </div>
        <div className="detail-title-stack">
          <h2>{species.icon} {species.name}</h2>
          {species.model_used && (
            <div className="source">Generated by {species.model_used}</div>
          )}
        </div>
      </div>
      
      <div className="detail-body">
        <LineageSection parents={species.parents} loading={lineageLoading} onSelectParent={onSelectParent} />
        
        <div className="detail-section">
          <div className="section-label">What It Does</div>
          <p>{species.what}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">How It Works</div>
          <p>{species.how}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">Constraints & Tradeoffs</div>
          <p className="constraint-text">{species.constraints_text}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">Combinatorial Notes</div>
          <p>{species.combo}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">Narrative Hooks</div>
          <p className="hook-text">{species.hooks}</p>
        </div>
        
        {species.tags && species.tags.length > 0 && (
          <div className="detail-section">
            <div className="section-label">Tags</div>
            <div className="tags-row">
              {species.tags.map(tag => (
                <span 
                  key={tag} 
                  className="tag"
                  onClick={() => onTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {species.stats && (
          <div className="detail-section">
            <div className="section-label">Functional Attributes</div>
            <StatBars stats={species.stats} color={color} />
          </div>
        )}

        <UsedInSection 
          children={species.children} 
          loading={lineageLoading} 
          onSelect={onSelectParent} 
        />
      </div>
    </>
  );
}

export default function DetailPanel({ species, lineageLoading, onEdit, onDelete, onTagClick, onAddToMixer, onSelect }) {
  if (!species) {
    return (
      <div className="detail">
        <EmptyState />
      </div>
    );
  }

  const color = CAT_COLORS[species.category] || 'var(--accent)';

  return (
    <div className="detail">
      {species.is_synthesized ? (
        <SynthesizedSpeciesDetail
          species={species}
          lineageLoading={lineageLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onTagClick={onTagClick}
          onAddToMixer={onAddToMixer}
          onSelectParent={onSelect}
        />
      ) : (
        <BaseMechanismDetail
          species={species}
          color={color}
          lineageLoading={lineageLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onTagClick={onTagClick}
          onAddToMixer={onAddToMixer}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}
