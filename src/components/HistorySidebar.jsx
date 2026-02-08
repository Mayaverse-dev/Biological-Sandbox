import { useState } from 'react';
import { History, ChevronLeft, ChevronRight, X, Trash2, Search } from 'lucide-react';

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}

export default function HistorySidebar({ 
  history, 
  currentSynthesisId,
  onSelectSynthesis, 
  onDeleteSynthesis,
  onClearAll,
  isOpen,
  onToggle 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredHistory = history.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.mechanisms?.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) {
    return (
      <div className="history-sidebar collapsed">
        <button className="history-expand-btn" onClick={onToggle} title="Open history">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>
        <div className="history-collapsed-content" onClick={onToggle}>
          <History size={18} strokeWidth={1.5} />
          <span className="history-collapsed-label">History</span>
        </div>
      </div>
    );
  }

  return (
    <div className="history-sidebar expanded">
      <div className="history-header">
        <div className="history-header-top">
          <h3>
            <History size={16} strokeWidth={1.5} />
            History
          </h3>
          <button className="history-collapse-btn" onClick={onToggle} title="Close history">
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="history-search">
          <Search size={14} strokeWidth={1.5} className="search-icon" />
          <input 
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">🧬</div>
            <p>
              {history.length === 0 
                ? "No syntheses yet. Combine mechanisms to create your first hybrid species!"
                : "No results match your search."}
            </p>
          </div>
        ) : (
          filteredHistory.map(item => (
            <div 
              key={item.id} 
              className={`history-item ${item.id === currentSynthesisId ? 'active' : ''}`}
              onClick={() => onSelectSynthesis(item)}
            >
              <div className="history-item-header">
                <h4>{item.name}</h4>
                <button 
                  className="history-item-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSynthesis(item.id);
                  }}
                  title="Delete"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>
              <div className="history-item-meta">
                <span>{item.mechanisms?.length || '?'} mechanisms</span>
                <span>·</span>
                <span>{formatRelativeTime(item.timestamp)}</span>
              </div>
              <div className="history-item-preview">
                {item.body?.substring(0, 80)}...
              </div>
            </div>
          ))
        )}
      </div>
      
      {history.length > 0 && (
        <div className="history-footer">
          <button onClick={onClearAll}>
            <Trash2 size={14} strokeWidth={1.5} />
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
