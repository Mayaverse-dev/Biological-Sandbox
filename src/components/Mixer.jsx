import { Trash2 } from 'lucide-react';
import { CAT_COLORS } from '../utils/constants';

export default function Mixer({ 
  slots, 
  onRemoveSlot, 
  onClearAll, 
  onAddSlot,
  onSynthesize,
  loading
}) {
  const filledSlots = slots.filter(s => s !== null);
  const canSynthesize = filledSlots.length >= 2;

  return (
    <div className="mixer">
      <div className="mixer-header">
        <div className="mixer-title-row">
          <h3>⚗ Synthesizer</h3>
          {filledSlots.length > 0 && (
            <button 
              className="icon-btn clear-all-btn" 
              onClick={onClearAll} 
              title="Clear all slots"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <p>Combine 2+ mechanisms. AI generates a speculative hybrid species.</p>
      </div>
      
      <div className="mixer-slots">
        {slots.map((slot, idx) => {
          if (slot) {
            const color = CAT_COLORS[slot.cat] || 'var(--accent)';
            return (
              <div 
                key={idx} 
                className="mixer-slot filled"
                style={{ borderColor: color }}
              >
                <div className="slot-icon">{slot.icon}</div>
                <div className="slot-info">
                  <div className="slot-name">{slot.name}</div>
                  <div className="slot-mech">{slot.mech}</div>
                </div>
                <button 
                  className="slot-remove"
                  onClick={() => onRemoveSlot(idx)}
                >
                  ×
                </button>
              </div>
            );
          }
          
          return (
            <div key={idx} className="mixer-slot">
              <div className="slot-empty">Slot {idx + 1}</div>
            </div>
          );
        })}
        
        <button className="add-slot-btn" onClick={onAddSlot}>
          + Add Slot
        </button>
      </div>
      
      <div className="mixer-actions">
        <button 
          className={`synth-btn ${loading ? 'loading' : ''}`}
          disabled={!canSynthesize || loading}
          onClick={onSynthesize}
        >
          {loading ? 'Synthesizing…' : 'Synthesize Hybrid'}
        </button>
      </div>
    </div>
  );
}
