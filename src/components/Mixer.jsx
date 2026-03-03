import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { CAT_COLORS, SYNTHESIS_SLIDERS } from '../utils/constants';

export default function Mixer({ 
  slots, 
  onRemoveSlot, 
  onClearAll, 
  onAddSlot,
  onSynthesize,
  loading,
  sliders,
  onSliderChange
}) {
  const [slidersExpanded, setSlidersExpanded] = useState(true);
  const filledSlots = slots.filter(s => s !== null);
  const canSynthesize = filledSlots.length >= 2;

  const biologicalSliders = SYNTHESIS_SLIDERS.filter(s => s.group === 'biological');
  const survivalSliders = SYNTHESIS_SLIDERS.filter(s => s.group === 'survival');

  const slidersDisabled = !canSynthesize || loading;

  const renderSlider = (slider) => (
    <div className={`slider-row ${slidersDisabled ? 'disabled' : ''}`} key={slider.key}>
      <div className="slider-header">
        <span className="slider-label">{slider.label}</span>
        <span className="slider-value">{sliders[slider.key]}</span>
      </div>
      <div className="slider-labels">
        <span className="slider-low">{slider.lowLabel}</span>
        <span className="slider-high">{slider.highLabel}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={sliders[slider.key]}
        onChange={(e) => onSliderChange(slider.key, parseInt(e.target.value))}
        className="slider-input"
        disabled={slidersDisabled}
      />
    </div>
  );

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
        <p>Combine 2+ species or mechanisms. AI generates a speculative hybrid.</p>
      </div>
      
      <div className="mixer-slots">
        {slots.map((slot, idx) => {
          if (slot) {
            const color = CAT_COLORS[slot.category] || 'var(--accent)';
            const subtext = slot.is_synthesized 
              ? `Synthesized • Gen ${slot.generation}` 
              : slot.mech;
            
            return (
              <div 
                key={idx} 
                className="mixer-slot filled"
                style={{ borderColor: color }}
              >
                <div className="slot-icon">{slot.icon}</div>
                <div className="slot-info">
                  <div className="slot-name">{slot.name}</div>
                  <div className="slot-mech">{subtext}</div>
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

      <div className="slider-section">
        <button 
          className="slider-toggle"
          onClick={() => setSlidersExpanded(!slidersExpanded)}
        >
          <span>Attribute Sliders</span>
          {slidersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {slidersExpanded && (
          <div className="slider-content">
            <div className="slider-group">
              <div className="slider-group-title">Biological</div>
              {biologicalSliders.map(renderSlider)}
            </div>
            <div className="slider-group">
              <div className="slider-group-title">Survival & Social</div>
              {survivalSliders.map(renderSlider)}
            </div>
          </div>
        )}
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
