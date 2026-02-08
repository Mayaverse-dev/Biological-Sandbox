import { useState, useRef, useEffect } from 'react';
import { CAT_COLORS, CATEGORIES } from '../utils/constants';

export default function CategoryDropdown({ selectedCategories, onSelectionChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const allSelected = selectedCategories.length === CATEGORIES.length;

  const filteredCategories = CATEGORIES.filter(cat =>
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      onSelectionChange(selectedCategories.filter(c => c !== cat));
    } else {
      onSelectionChange([...selectedCategories, cat]);
    }
  };

  const handleToggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...CATEGORIES]);
    }
  };

  const getDisplayText = () => {
    if (allSelected) return 'All Categories';
    if (selectedCategories.length === 0) return 'No Categories';
    if (selectedCategories.length === 1) return selectedCategories[0];
    return `${selectedCategories.length} Categories`;
  };

  return (
    <div className="filter-dropdown-wrapper">
      <div className="filter-dropdown" ref={dropdownRef}>
        <button 
          className={`filter-dropdown-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="selected-count">
            <span>{getDisplayText()}</span>
            {!allSelected && selectedCategories.length > 0 && (
              <span className="count-badge">{selectedCategories.length}</span>
            )}
          </div>
          <span className="chevron">▼</span>
        </button>

        {isOpen && (
          <div className="filter-dropdown-menu">
            <div className="filter-search">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-options">
              {filteredCategories.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                const color = CAT_COLORS[cat] || 'var(--accent)';
                
                return (
                  <div
                    key={cat}
                    className={`filter-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleCategory(cat)}
                  >
                    <div className="filter-checkbox">
                      {isSelected && <span className="filter-checkbox-icon">✓</span>}
                    </div>
                    <span className="filter-option-label">{cat}</span>
                    <span 
                      className="filter-option-dot" 
                      style={{ background: color }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="filter-actions">
              <button 
                className="filter-action-btn primary"
                onClick={handleToggleAll}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
