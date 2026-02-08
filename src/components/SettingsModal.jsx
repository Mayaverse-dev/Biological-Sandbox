import { useState, useEffect } from 'react';
import { MODELS, DEFAULT_SYSTEM_PROMPT } from '../utils/constants';

export default function SettingsModal({ settings, onSave, onClose }) {
  const [form, setForm] = useState({
    model: settings.model || MODELS[0].id,
    systemPrompt: settings.systemPrompt || ''
  });

  useEffect(() => {
    setForm({
      model: settings.model || MODELS[0].id,
      systemPrompt: settings.systemPrompt || ''
    });
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const handleReset = () => {
    setForm(prev => ({
      ...prev,
      systemPrompt: ''
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Settings</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>AI Model</label>
              <select 
                value={form.model}
                onChange={e => setForm(prev => ({ ...prev, model: e.target.value }))}
              >
                {MODELS.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                System Prompt 
                <span style={{ 
                  fontWeight: 'normal', 
                  color: 'var(--text-faint)',
                  marginLeft: 8,
                  textTransform: 'none',
                  letterSpacing: 'normal'
                }}>
                  (leave empty for default)
                </span>
              </label>
              <textarea 
                value={form.systemPrompt}
                onChange={e => setForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder={DEFAULT_SYSTEM_PROMPT}
                style={{ minHeight: 200 }}
              />
              <div style={{ marginTop: 8 }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleReset}
                  style={{ padding: '6px 12px', fontSize: 10 }}
                >
                  Reset to Default
                </button>
              </div>
              <div style={{ 
                marginTop: 12, 
                fontSize: 11, 
                color: 'var(--text-faint)',
                lineHeight: 1.5
              }}>
                <strong>Available variables:</strong><br />
                <code style={{ color: 'var(--accent)' }}>${'${mechanisms.length}'}</code> — Number of mechanisms<br />
                <code style={{ color: 'var(--accent)' }}>${'${ingredients}'}</code> — Formatted mechanism details
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
