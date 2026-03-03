import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { MODELS, DEFAULT_SLIDERS } from './utils/constants';
import { 
  fetchSpecies, 
  fetchSpeciesLineage,
  createSpecies,
  updateSpecies,
  deleteSpecies,
  synthesize, 
  saveSynthesisResult
} from './utils/api';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import Mixer from './components/Mixer';
import SynthesisView from './components/SynthesisView';
import EntryForm from './components/EntryForm';
import SettingsModal from './components/SettingsModal';

export default function App() {
  // Theme state (keep in localStorage)
  const [theme, setTheme] = useLocalStorage('bio-sandbox-theme', 'dark');
  
  // Settings state (keep in localStorage)
  const [settings, setSettings] = useLocalStorage('bio-sandbox-settings', {
    model: MODELS[0].id,
    systemPrompt: ''
  });

  // Species from database
  const [species, setSpecies] = useState([]);
  const [speciesLoading, setSpeciesLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [lineageLoading, setLineageLoading] = useState(false);

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mixerSlots, setMixerSlots] = useState([null, null]);
  const [sliders, setSliders] = useState(DEFAULT_SLIDERS);
  
  // View state: 'browse' or 'synthesis'
  const [viewMode, setViewMode] = useState('browse');
  const [currentSynthesis, setCurrentSynthesis] = useState(null);
  const [synthesisLoading, setSynthesisLoading] = useState(false);
  const [synthesisError, setSynthesisError] = useState(null);
  const [synthesisSaving, setSynthesisSaving] = useState(false);
  const [synthesisSaved, setSynthesisSaved] = useState(false);
  
  // Modal state
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load species from database
  const loadSpecies = useCallback(async () => {
    try {
      setSpeciesLoading(true);
      const data = await fetchSpecies();
      setSpecies(data);
    } catch (err) {
      console.error('Failed to load species:', err);
      showToast('Failed to load species');
    } finally {
      setSpeciesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpecies();
  }, [loadSpecies]);

  // Load selected species from cache, lazy-load lineage in background
  useEffect(() => {
    if (!selectedId) {
      setSelectedSpecies(null);
      setLineageLoading(false);
      return;
    }

    // Immediately use cached species data
    const cached = species.find(s => s.id === selectedId);
    if (!cached) {
      setSelectedSpecies(null);
      setLineageLoading(false);
      return;
    }

    // Set cached data immediately (instant display)
    setSelectedSpecies({ ...cached, parents: null, children: null });

    // Fetch lineage (parents/children) in background for all species
    setLineageLoading(true);
    fetchSpeciesLineage(selectedId)
      .then(lineage => {
        setSelectedSpecies(prev => 
          prev?.id === selectedId 
            ? { ...prev, parents: lineage.parents, children: lineage.children }
            : prev
        );
      })
      .catch(err => {
        console.error('Failed to load lineage:', err);
      })
      .finally(() => {
        setLineageLoading(false);
      });
  }, [selectedId, species]);

  const allTags = useMemo(() => {
    const tags = new Set();
    species.forEach(s => (s.tags || []).forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [species]);

  const tagCount = allTags.length;

  // Show toast helper
  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  // Entry handlers
  const handleSaveEntry = useCallback(async (entry) => {
    try {
      const speciesData = {
        name: entry.name,
        icon: entry.icon,
        category: entry.cat,
        mech: entry.mech,
        source: entry.source,
        what: entry.what,
        how: entry.how,
        combo: entry.combo,
        hooks: entry.hooks,
        constraints_text: entry.constraints,
        tags: entry.tags,
        stats: entry.stats
      };

      let saved;
      if (entry.id && !entry.id.startsWith('new-')) {
        saved = await updateSpecies(entry.id, speciesData);
      } else {
        saved = await createSpecies(speciesData);
      }

      await loadSpecies();
      setShowEntryForm(false);
      setEditingEntry(null);
      setSelectedId(saved.id);
      showToast('Entry saved');
    } catch (err) {
      console.error('Failed to save entry:', err);
      showToast('Failed to save entry');
    }
  }, [loadSpecies, showToast]);

  const handleDeleteEntry = useCallback((id) => {
    setShowDeleteConfirm(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (showDeleteConfirm) {
      try {
        await deleteSpecies(showDeleteConfirm);
        await loadSpecies();
        
        if (selectedId === showDeleteConfirm) {
          setSelectedId(null);
        }
        
        setMixerSlots(prev => prev.map(slot => 
          slot?.id === showDeleteConfirm ? null : slot
        ));
        
        setShowDeleteConfirm(null);
        showToast('Entry deleted');
      } catch (err) {
        console.error('Failed to delete:', err);
        showToast('Failed to delete entry');
      }
    }
  }, [showDeleteConfirm, selectedId, loadSpecies, showToast]);

  const handleEditEntry = useCallback((entry) => {
    const formEntry = {
      id: entry.id,
      name: entry.name,
      icon: entry.icon,
      cat: entry.category,
      mech: entry.mech,
      source: entry.source,
      what: entry.what,
      how: entry.how,
      combo: entry.combo,
      hooks: entry.hooks,
      constraints: entry.constraints_text,
      tags: entry.tags || [],
      stats: typeof entry.stats === 'string' ? JSON.parse(entry.stats) : entry.stats
    };
    setEditingEntry(formEntry);
    setShowEntryForm(true);
  }, []);

  // Mixer handlers
  const handleAddToMixer = useCallback((entry) => {
    setMixerSlots(prev => {
      if (prev.some(s => s?.id === entry.id)) return prev;
      
      const emptyIdx = prev.findIndex(s => s === null);
      if (emptyIdx >= 0) {
        const updated = [...prev];
        updated[emptyIdx] = entry;
        return updated;
      }
      
      return [...prev, entry];
    });
  }, []);

  const handleRemoveSlot = useCallback((idx) => {
    setMixerSlots(prev => {
      const filled = prev.filter((_, i) => i !== idx).filter(s => s !== null);
      while (filled.length < 2) {
        filled.push(null);
      }
      return filled;
    });
  }, []);

  const handleAddSlot = useCallback(() => {
    setMixerSlots(prev => [...prev, null]);
  }, []);

  const handleClearMixer = useCallback(() => {
    setMixerSlots([null, null]);
    setSliders(DEFAULT_SLIDERS);
  }, []);

  const handleSliderChange = useCallback((key, value) => {
    setSliders(prev => ({ ...prev, [key]: value }));
  }, []);

  // Synthesis handlers
  const handleSynthesize = useCallback(async () => {
    const filledSlots = mixerSlots.filter(s => s !== null);
    if (filledSlots.length < 2) return;

    setSynthesisLoading(true);
    setSynthesisError(null);
    setCurrentSynthesis(null);
    setSynthesisSaved(false);
    setViewMode('synthesis');

    try {
      const response = await synthesize(filledSlots, settings.model, settings.systemPrompt, sliders);
      // response.result is already parsed JSON from structured output
      const result = response.result;
      
      const synthesis = {
        // Unified structure (same fields as base mechanisms)
        name: result.name,
        what: result.what,
        how: result.how,
        constraints: result.constraints,
        combo: result.combo,
        hooks: result.hooks,
        stats: result.stats,
        tags: result.tags,
        // Synthesis metadata
        generation: response.generation,
        parent_ids: response.parent_ids,
        parent_tags: response.parent_tags,
        parents: filledSlots,
        model: settings.model
      };
      
      setCurrentSynthesis(synthesis);
    } catch (err) {
      setSynthesisError(err.message);
    } finally {
      setSynthesisLoading(false);
    }
  }, [mixerSlots, settings.model, settings.systemPrompt, sliders]);

  const handleSaveSynthesis = useCallback(async () => {
    if (!currentSynthesis || synthesisSaved) return;

    setSynthesisSaving(true);
    try {
      const saved = await saveSynthesisResult(
        {
          name: currentSynthesis.name,
          what: currentSynthesis.what,
          how: currentSynthesis.how,
          constraints: currentSynthesis.constraints,
          combo: currentSynthesis.combo,
          hooks: currentSynthesis.hooks,
          stats: currentSynthesis.stats,
          tags: currentSynthesis.tags
        },
        currentSynthesis.generation,
        currentSynthesis.parent_ids,
        currentSynthesis.parent_tags || [],
        currentSynthesis.model
      );

      setSynthesisSaved(true);
      await loadSpecies();
      showToast('Species saved!');
      
      setCurrentSynthesis(prev => ({ ...prev, id: saved.id }));
    } catch (err) {
      console.error('Failed to save synthesis:', err);
      showToast('Failed to save species');
    } finally {
      setSynthesisSaving(false);
    }
  }, [currentSynthesis, synthesisSaved, loadSpecies, showToast]);

  const handleBackToBrowse = useCallback(() => {
    setViewMode('browse');
    setSynthesisError(null);
    setCurrentSynthesis(null);
    setSynthesisSaved(false);
  }, []);

  const handleRegenerate = useCallback(() => {
    setSynthesisSaved(false);
    handleSynthesize();
  }, [handleSynthesize]);

  // Select handler
  const handleSelect = useCallback((id) => {
    setSelectedId(id);
    setViewMode('browse');
  }, []);

  // Search/filter handlers
  const handleTagClick = useCallback((tag) => {
    setSearchQuery(tag);
  }, []);

  return (
    <div className="app">
      <Header 
        entryCount={species.length}
        tagCount={tagCount}
        onOpenSettings={() => setShowSettings(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <div className="main">
        <Sidebar 
          species={species}
          selectedId={selectedId}
          onSelect={handleSelect}
          onAddToMixer={handleAddToMixer}
          onOpenAddEntry={() => {
            setEditingEntry(null);
            setShowEntryForm(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="center-panel">
          {viewMode === 'browse' ? (
            <DetailPanel 
              species={selectedSpecies}
              lineageLoading={lineageLoading}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              onTagClick={handleTagClick}
              onAddToMixer={handleAddToMixer}
              onSelect={handleSelect}
            />
          ) : (
            <SynthesisView
              synthesis={currentSynthesis}
              loading={synthesisLoading}
              error={synthesisError}
              onBack={handleBackToBrowse}
              onSave={handleSaveSynthesis}
              onRegenerate={handleRegenerate}
              saving={synthesisSaving}
              saved={synthesisSaved}
            />
          )}
        </div>
        
        <Mixer 
          slots={mixerSlots}
          onRemoveSlot={handleRemoveSlot}
          onAddSlot={handleAddSlot}
          onClearAll={handleClearMixer}
          onSynthesize={handleSynthesize}
          loading={synthesisLoading}
          sliders={sliders}
          onSliderChange={handleSliderChange}
        />
      </div>

      {showEntryForm && (
        <EntryForm 
          entry={editingEntry}
          existingTags={allTags}
          onSave={handleSaveEntry}
          onClose={() => {
            setShowEntryForm(false);
            setEditingEntry(null);
          }}
        />
      )}

      {showSettings && (
        <SettingsModal 
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3>Delete Entry?</h3>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-dim)' }}>
                Are you sure you want to delete this entry? This action cannot be undone.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
