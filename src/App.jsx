import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { defaultEntries } from './data/defaultEntries';
import { MODELS, CATEGORIES } from './utils/constants';
import { synthesize, parseHybridResult } from './utils/api';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DetailPanel from './components/DetailPanel';
import Mixer from './components/Mixer';
import SynthesisView from './components/SynthesisView';
import HistorySidebar from './components/HistorySidebar';
import EntryForm from './components/EntryForm';
import SettingsModal from './components/SettingsModal';

export default function App() {
  // Theme state
  const [theme, setTheme] = useLocalStorage('bio-sandbox-theme', 'dark');
  
  // Entries state with localStorage
  const [entries, setEntries] = useLocalStorage('bio-sandbox-entries', defaultEntries);
  
  // Settings state with localStorage
  const [settings, setSettings] = useLocalStorage('bio-sandbox-settings', {
    model: MODELS[0].id,
    systemPrompt: ''
  });

  // Synthesis history
  const [synthesisHistory, setSynthesisHistory] = useLocalStorage('bio-sandbox-history', []);

  // UI state
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([...CATEGORIES]); // All selected by default
  const [mixerSlots, setMixerSlots] = useState([null, null]);
  
  // View state: 'browse' or 'synthesis'
  const [viewMode, setViewMode] = useState('browse');
  const [currentSynthesis, setCurrentSynthesis] = useState(null);
  const [synthesisLoading, setSynthesisLoading] = useState(false);
  const [synthesisError, setSynthesisError] = useState(null);
  
  // History sidebar state - collapsed by default
  const [historyOpen, setHistoryOpen] = useLocalStorage('bio-sandbox-history-open', false);
  
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

  // Computed values
  const selectedEntry = useMemo(() => 
    entries.find(e => e.id === selectedId), 
    [entries, selectedId]
  );

  const allTags = useMemo(() => {
    const tags = new Set();
    entries.forEach(e => e.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [entries]);

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
  const handleSaveEntry = useCallback((entry) => {
    setEntries(prev => {
      const existing = prev.findIndex(e => e.id === entry.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = entry;
        return updated;
      }
      return [...prev, entry];
    });
    setShowEntryForm(false);
    setEditingEntry(null);
    setSelectedId(entry.id);
  }, [setEntries]);

  const handleDeleteEntry = useCallback((id) => {
    setShowDeleteConfirm(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (showDeleteConfirm) {
      setEntries(prev => prev.filter(e => e.id !== showDeleteConfirm));
      if (selectedId === showDeleteConfirm) {
        setSelectedId(null);
      }
      // Remove from mixer if present
      setMixerSlots(prev => prev.map(slot => 
        slot?.id === showDeleteConfirm ? null : slot
      ));
      setShowDeleteConfirm(null);
    }
  }, [showDeleteConfirm, selectedId, setEntries]);

  const handleEditEntry = useCallback((entry) => {
    setEditingEntry(entry);
    setShowEntryForm(true);
  }, []);

  // Mixer handlers
  const handleAddToMixer = useCallback((entry) => {
    setMixerSlots(prev => {
      // Don't add if already in mixer
      if (prev.some(s => s?.id === entry.id)) return prev;
      
      // Find first empty slot
      const emptyIdx = prev.findIndex(s => s === null);
      if (emptyIdx >= 0) {
        const updated = [...prev];
        updated[emptyIdx] = entry;
        return updated;
      }
      
      // All slots full, add new slot
      return [...prev, entry];
    });
  }, []);

  const handleRemoveSlot = useCallback((idx) => {
    setMixerSlots(prev => {
      // Remove the item and compact the array (no gaps)
      const filled = prev.filter((_, i) => i !== idx).filter(s => s !== null);
      // Pad with nulls to maintain at least 2 slots
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
  }, []);

  // Synthesis handlers
  const handleSynthesize = useCallback(async () => {
    const filledSlots = mixerSlots.filter(s => s !== null);
    if (filledSlots.length < 2) return;

    setSynthesisLoading(true);
    setSynthesisError(null);
    setCurrentSynthesis(null);
    setViewMode('synthesis');

    try {
      const text = await synthesize(filledSlots, settings.model, settings.systemPrompt);
      const parsed = parseHybridResult(text);
      
      const synthesis = {
        id: `synth-${Date.now()}`,
        timestamp: Date.now(),
        name: parsed.name,
        body: parsed.body,
        mechanism: parsed.mechanism,
        constraints: parsed.constraints,
        narrative: parsed.narrative,
        mechanisms: filledSlots,
        model: settings.model
      };
      
      setCurrentSynthesis(synthesis);
      // Auto-save to history
      setSynthesisHistory(prev => [synthesis, ...prev].slice(0, 50));
    } catch (err) {
      setSynthesisError(err.message);
    } finally {
      setSynthesisLoading(false);
    }
  }, [mixerSlots, settings.model, settings.systemPrompt]);

  const handleSelectFromHistory = useCallback((item) => {
    setCurrentSynthesis(item);
    setViewMode('synthesis');
  }, []);

  const handleDeleteFromHistory = useCallback((id) => {
    setSynthesisHistory(prev => prev.filter(h => h.id !== id));
    if (currentSynthesis?.id === id) {
      setCurrentSynthesis(null);
      setViewMode('browse');
    }
  }, [currentSynthesis, setSynthesisHistory]);

  const handleClearHistory = useCallback(() => {
    setSynthesisHistory([]);
    showToast('History cleared');
  }, [setSynthesisHistory, showToast]);

  const handleBackToBrowse = useCallback(() => {
    setViewMode('browse');
    setSynthesisError(null);
  }, []);

  const handleRegenerate = useCallback(() => {
    handleSynthesize();
  }, [handleSynthesize]);

  // Search/filter handlers
  const handleTagClick = useCallback((tag) => {
    setSearchQuery(tag);
  }, []);

  return (
    <div className="app">
      <Header 
        entryCount={entries.length}
        tagCount={tagCount}
        onOpenSettings={() => setShowSettings(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <div className={`main ${!historyOpen ? 'history-collapsed' : ''}`}>
        <Sidebar 
          entries={entries}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setViewMode('browse');
          }}
          onAddToMixer={handleAddToMixer}
          onOpenAddEntry={() => {
            setEditingEntry(null);
            setShowEntryForm(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
        />
        
        <div className="center-panel">
          {viewMode === 'browse' ? (
            <DetailPanel 
              entry={selectedEntry}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              onTagClick={handleTagClick}
            />
          ) : (
            <SynthesisView
              synthesis={currentSynthesis}
              loading={synthesisLoading}
              error={synthesisError}
              onBack={handleBackToBrowse}
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
        />

        <HistorySidebar
          history={synthesisHistory}
          currentSynthesisId={currentSynthesis?.id}
          onSelectSynthesis={handleSelectFromHistory}
          onDeleteSynthesis={handleDeleteFromHistory}
          onClearAll={handleClearHistory}
          isOpen={historyOpen}
          onToggle={() => setHistoryOpen(prev => !prev)}
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
