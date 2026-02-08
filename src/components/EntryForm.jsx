import { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../utils/constants';

const STAT_KEYS = ['resilience', 'offense', 'regen', 'complexity', 'social'];

const defaultEntry = {
  name: '',
  icon: '🧬',
  cat: 'Metabolism',
  mech: '',
  source: '',
  what: '',
  how: '',
  constraints: '',
  combo: '',
  hooks: '',
  tags: [],
  stats: { resilience: 50, offense: 50, regen: 50, complexity: 50, social: 50 }
};

export default function EntryForm({ entry, existingTags = [], onSave, onClose }) {
  const [form, setForm] = useState(defaultEntry);
  const [tagsInput, setTagsInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const tagsInputRef = useRef(null);

  useEffect(() => {
    if (entry) {
      setForm(entry);
      setTagsInput(entry.tags.join(', '));
    } else {
      setForm(defaultEntry);
      setTagsInput('');
    }
  }, [entry]);

  // Get suggestions based on current input
  useEffect(() => {
    const parts = tagsInput.split(',');
    const currentTag = parts[parts.length - 1].trim().toLowerCase();
    
    if (currentTag.length > 0) {
      const currentTags = parts.slice(0, -1).map(t => t.trim().toLowerCase());
      const filtered = existingTags.filter(tag => 
        tag.toLowerCase().includes(currentTag) && 
        !currentTags.includes(tag.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [tagsInput, existingTags]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (stat, value) => {
    setForm(prev => ({
      ...prev,
      stats: { ...prev.stats, [stat]: parseInt(value) }
    }));
  };

  const handleSelectSuggestion = (tag) => {
    const parts = tagsInput.split(',');
    parts[parts.length - 1] = ' ' + tag;
    setTagsInput(parts.join(',') + ', ');
    setShowSuggestions(false);
    tagsInputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const finalEntry = {
      ...form,
      tags,
      id: entry?.id || `custom-${Date.now()}`
    };

    onSave(finalEntry);
  };

  const isEditing = !!entry;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Entry' : 'Add New Entry'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row-3">
              <div className="form-group">
                <label>Icon</label>
                <input 
                  type="text" 
                  value={form.icon}
                  onChange={e => handleChange('icon', e.target.value)}
                  placeholder="🧬"
                  maxLength={4}
                />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="Species name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={form.cat}
                  onChange={e => handleChange('cat', e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Mechanism</label>
              <input 
                type="text" 
                value={form.mech}
                onChange={e => handleChange('mech', e.target.value)}
                placeholder="Core biological mechanism"
                required
              />
            </div>

            <div className="form-group">
              <label>Source</label>
              <input 
                type="text" 
                value={form.source}
                onChange={e => handleChange('source', e.target.value)}
                placeholder="Real-world source organism"
              />
            </div>

            <div className="form-group">
              <label>What It Does</label>
              <textarea 
                value={form.what}
                onChange={e => handleChange('what', e.target.value)}
                placeholder="Describe what this mechanism does..."
                required
              />
            </div>

            <div className="form-group">
              <label>How It Works</label>
              <textarea 
                value={form.how}
                onChange={e => handleChange('how', e.target.value)}
                placeholder="Explain the biological mechanism..."
                required
              />
            </div>

            <div className="form-group">
              <label>Constraints & Tradeoffs</label>
              <textarea 
                value={form.constraints}
                onChange={e => handleChange('constraints', e.target.value)}
                placeholder="What are the costs and limitations?"
              />
            </div>

            <div className="form-group">
              <label>Combinatorial Notes</label>
              <textarea 
                value={form.combo}
                onChange={e => handleChange('combo', e.target.value)}
                placeholder="How does this pair with other mechanisms?"
              />
            </div>

            <div className="form-group">
              <label>Narrative Hooks</label>
              <textarea 
                value={form.hooks}
                onChange={e => handleChange('hooks', e.target.value)}
                placeholder="Story potential and philosophical questions..."
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Tags (comma-separated)</label>
              <input 
                ref={tagsInputRef}
                type="text" 
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="extremophile, symbiosis, regeneration"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="tag-suggestions">
                  {suggestions.map(tag => (
                    <div 
                      key={tag} 
                      className="tag-suggestion"
                      onMouseDown={() => handleSelectSuggestion(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Functional Attributes</label>
              {STAT_KEYS.map(stat => (
                <div className="stat-slider" key={stat}>
                  <span className="stat-label" style={{ width: 80, textTransform: 'capitalize' }}>
                    {stat}
                  </span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={form.stats[stat]}
                    onChange={e => handleStatChange(stat, e.target.value)}
                  />
                  <span className="stat-value">{form.stats[stat]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
