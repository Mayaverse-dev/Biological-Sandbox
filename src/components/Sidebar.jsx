import { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { CAT_COLORS, CATEGORIES } from '../utils/constants';

function TreeNode({ label, count, isOpen, onToggle, color, children }) {
  return (
    <div className="tree-node">
      <div className="tree-node-header" onClick={onToggle}>
        <span className="tree-chevron">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="tree-label" style={{ color }}>
          {label}
        </span>
        <span className="tree-count">{count}</span>
      </div>
      {isOpen && <div className="tree-children">{children}</div>}
    </div>
  );
}

function SpeciesItem({ species, isSelected, onSelect, onAddToMixer }) {
  const displayName = species.is_synthesized ? species.name : species.name;
  const subtext = species.is_synthesized 
    ? `Gen ${species.generation}` 
    : species.mech;

  return (
    <div 
      className={`specimen-item ${isSelected ? 'active' : ''}`}
      onClick={() => onSelect(species.id)}
    >
      <div className="icon">{species.icon}</div>
      <div className="info">
        <div className="name">{displayName}</div>
        <div className="mech">{subtext}</div>
      </div>
      <button 
        className="add-btn"
        onClick={(e) => {
          e.stopPropagation();
          onAddToMixer(species);
        }}
        title="Add to synthesizer"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function Sidebar({ 
  species, 
  loading,
  selectedId, 
  onSelect, 
  onAddToMixer,
  onOpenAddEntry,
  searchQuery,
  onSearchChange
}) {
  const [expandedCategories, setExpandedCategories] = useLocalStorage('bio-sidebar-cats', () => {
    const initial = {};
    CATEGORIES.forEach(cat => { initial[cat] = true; });
    initial['Synthesized'] = true;
    return initial;
  });

  const [expandedGenerations, setExpandedGenerations] = useLocalStorage('bio-sidebar-gens', {});

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleGeneration = (gen) => {
    setExpandedGenerations(prev => ({ ...prev, [gen]: !prev[gen] }));
  };

  const filteredSpecies = useMemo(() => {
    if (!searchQuery) return species;
    
    const query = searchQuery.toLowerCase();
    return species.filter(s => {
      const searchText = [
        s.name, 
        s.mech, 
        s.source, 
        s.what,
        s.body,
        ...(s.tags || [])
      ].filter(Boolean).join(' ').toLowerCase();
      return searchText.includes(query);
    });
  }, [species, searchQuery]);

  const { baseByCategory, synthesizedByGen } = useMemo(() => {
    const baseByCategory = {};
    const synthesizedByGen = {};

    CATEGORIES.forEach(cat => { baseByCategory[cat] = []; });

    filteredSpecies.forEach(s => {
      if (s.is_synthesized) {
        const gen = s.generation || 1;
        if (!synthesizedByGen[gen]) synthesizedByGen[gen] = [];
        synthesizedByGen[gen].push(s);
      } else {
        const cat = s.category || 'Metabolism';
        if (baseByCategory[cat]) {
          baseByCategory[cat].push(s);
        }
      }
    });

    return { baseByCategory, synthesizedByGen };
  }, [filteredSpecies]);

  const generations = Object.keys(synthesizedByGen).map(Number).sort((a, b) => a - b);
  const totalSynthesized = Object.values(synthesizedByGen).flat().length;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search species, mechanisms, tags…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button className="add-entry-btn" onClick={onOpenAddEntry} title="Add new entry">
          <Plus size={16} />
        </button>
      </div>
      
      <div className="tree-view">
        {loading && (
          <div className="sidebar-loading">
            <div className="sidebar-spinner" />
            <span>Loading species…</span>
          </div>
        )}
        {!loading && (
          <>
            {CATEGORIES.map(cat => {
              const items = baseByCategory[cat];
              if (items.length === 0 && searchQuery) return null;
              
              return (
                <TreeNode
                  key={cat}
                  label={cat}
                  count={items.length}
                  isOpen={expandedCategories[cat]}
                  onToggle={() => toggleCategory(cat)}
                  color={CAT_COLORS[cat]}
                >
                  {items.map(s => (
                    <SpeciesItem
                      key={s.id}
                      species={s}
                      isSelected={s.id === selectedId}
                      onSelect={onSelect}
                      onAddToMixer={onAddToMixer}
                    />
                  ))}
                </TreeNode>
              );
            })}

            {(totalSynthesized > 0 || !searchQuery) && (
              <>
                <div className="tree-divider" />
                
                <TreeNode
                  label="Synthesized Species"
                  count={totalSynthesized}
                  isOpen={expandedCategories['Synthesized']}
                  onToggle={() => toggleCategory('Synthesized')}
                  color="var(--accent)"
                >
                  {generations.length === 0 ? (
                    <div className="tree-empty">No synthesized species yet</div>
                  ) : (
                    generations.map(gen => {
                      const items = synthesizedByGen[gen];
                      const isGenExpanded = expandedGenerations[gen] !== false;
                      
                      return (
                        <TreeNode
                          key={`gen-${gen}`}
                          label={`Gen ${gen}`}
                          count={items.length}
                          isOpen={isGenExpanded}
                          onToggle={() => toggleGeneration(gen)}
                          color="var(--text-dim)"
                        >
                          {items.map(s => (
                            <SpeciesItem
                              key={s.id}
                              species={s}
                              isSelected={s.id === selectedId}
                              onSelect={onSelect}
                              onAddToMixer={onAddToMixer}
                            />
                          ))}
                        </TreeNode>
                      );
                    })
                  )}
                </TreeNode>
              </>
            )}

            {filteredSpecies.length === 0 && searchQuery && (
              <div className="tree-empty" style={{ padding: '32px 16px' }}>
                No species found matching "{searchQuery}"
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
