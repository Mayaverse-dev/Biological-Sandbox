import { useMemo } from 'react';
import { CAT_COLORS, CATEGORIES } from '../utils/constants';
import CategoryDropdown from './CategoryDropdown';

export default function Sidebar({ 
  entries, 
  selectedId, 
  onSelect, 
  onAddToMixer,
  onOpenAddEntry,
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryChange
}) {
  const filteredEntries = useMemo(() => {
    let items = entries;
    
    // Filter by selected categories (empty array or all selected = show all)
    const allSelected = selectedCategories.length === CATEGORIES.length || selectedCategories.length === 0;
    if (!allSelected) {
      items = items.filter(d => selectedCategories.includes(d.cat));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(d => {
        const blob = [d.name, d.mech, d.source, d.what, ...d.tags].join(' ').toLowerCase();
        return blob.includes(query);
      });
    }
    
    return items;
  }, [entries, selectedCategories, searchQuery]);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search mechanisms, organisms, tags…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button className="add-entry-btn" onClick={onOpenAddEntry} title="Add new entry">
          +
        </button>
      </div>
      
      <CategoryDropdown 
        selectedCategories={selectedCategories}
        onSelectionChange={onCategoryChange}
      />
      
      <div className="specimen-list">
        {filteredEntries.map(entry => {
          const color = CAT_COLORS[entry.cat] || 'var(--accent)';
          return (
            <div 
              key={entry.id}
              className={`specimen-item ${entry.id === selectedId ? 'active' : ''}`}
              onClick={() => onSelect(entry.id)}
            >
              <div className="icon">{entry.icon}</div>
              <div className="info">
                <div className="name">{entry.name}</div>
                <div className="mech">{entry.mech}</div>
              </div>
              <button 
                className="add-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToMixer(entry);
                }}
                title="Add to synthesizer"
              >
                +
              </button>
            </div>
          );
        })}
        {filteredEntries.length === 0 && (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <p>No mechanisms found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
