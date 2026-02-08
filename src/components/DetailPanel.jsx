import { CAT_COLORS } from '../utils/constants';
import EmptyState from './EmptyState';

export default function DetailPanel({ entry, onEdit, onDelete, onTagClick }) {
  if (!entry) {
    return (
      <div className="detail">
        <EmptyState />
      </div>
    );
  }

  const color = CAT_COLORS[entry.cat] || 'var(--accent)';

  const statsHTML = Object.entries(entry.stats).map(([k, v]) => (
    <div className="stat-row" key={k}>
      <div className="stat-label">{k}</div>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${v}%`, background: color }} />
      </div>
      <div className="stat-val">{v}</div>
    </div>
  ));

  return (
    <div className="detail">
      <div className="detail-header">
        <div className="detail-header-actions">
          <button className="detail-action-btn" onClick={() => onEdit(entry)}>
            Edit
          </button>
          <button className="detail-action-btn delete" onClick={() => onDelete(entry.id)}>
            Delete
          </button>
        </div>
        <div 
          className="cat-badge" 
          style={{ 
            background: `${color}22`, 
            color: color, 
            border: `1px solid ${color}44` 
          }}
        >
          {entry.cat}
        </div>
        <h2>{entry.name}</h2>
        <div className="subtitle">{entry.mech}</div>
        <div className="source">{entry.source}</div>
      </div>
      
      <div className="detail-body">
        <div className="detail-section">
          <div className="section-label">What It Does</div>
          <p>{entry.what}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">How It Works</div>
          <p>{entry.how}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">Constraints & Tradeoffs</div>
          <p className="constraint-text">{entry.constraints}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">Combinatorial Notes</div>
          <p>{entry.combo}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">Narrative Hooks</div>
          <p className="hook-text">{entry.hooks}</p>
        </div>
        
        <div className="detail-section">
          <div className="section-label">Tags</div>
          <div className="tags-row">
            {entry.tags.map(tag => (
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
        
        <div className="detail-section">
          <div className="section-label">Functional Attributes</div>
          <div className="stat-bars">{statsHTML}</div>
        </div>
      </div>
    </div>
  );
}
