import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FiX, FiTrash2, FiPlus } from 'react-icons/fi';

const PRESET_COLORS = [
  '#c4c4c4', '#fdab3d', '#00c875', '#e2445c', 
  '#a25ddc', '#0086c0', '#579bfc', '#ff7575',
  '#ffadad', '#333333', '#7f5347', '#9cd326'
];

const StatusEditorModal = ({ statusOptions, setStatusOptions, onClose }) => {
  const [options, setOptions] = useState([...statusOptions]);
  const [editingId, setEditingId] = useState(null);

  const handleSave = () => {
    setStatusOptions(options);
    onClose();
  };

  const handleAddOption = () => {
    const newOption = {
      id: uuidv4(),
      label: 'New Label',
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]
    };
    setOptions([...options, newOption]);
  };

  const handleRemoveOption = (id) => {
    if (id === 'empty') return; // Cannot delete empty status
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleUpdateOption = (id, field, value) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, [field]: value } : opt));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '400px' }}>
        <div className="modal-header">
          <h2>Edit Labels</h2>
          <button className="icon-btn" onClick={onClose}><FiX size={20} /></button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {options.map(opt => (
            <div key={opt.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              
              <div style={{ position: 'relative' }}>
                <div 
                  style={{ 
                    width: '30px', height: '30px', borderRadius: '4px', 
                    backgroundColor: opt.color, cursor: 'pointer', border: '1px solid var(--border-color)' 
                  }}
                  onClick={() => setEditingId(editingId === opt.id ? null : opt.id)}
                />
                
                {editingId === opt.id && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: '5px',
                    background: 'var(--bg-panel)', padding: '0.5rem', borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', flexWrap: 'wrap', width: '150px', gap: '5px'
                  }}>
                    {PRESET_COLORS.map(color => (
                      <div 
                        key={color}
                        onClick={() => {
                          handleUpdateOption(opt.id, 'color', color);
                          setEditingId(null);
                        }}
                        style={{ width: '25px', height: '25px', backgroundColor: color, borderRadius: '4px', cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <input 
                type="text" 
                value={opt.label} 
                onChange={(e) => handleUpdateOption(opt.id, 'label', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px' }}
                disabled={opt.id === 'empty'}
                placeholder={opt.id === 'empty' ? 'Empty default (No label)' : 'Label name'}
              />

              {opt.id !== 'empty' && (
                <button className="icon-btn" style={{ color: 'var(--text-muted)' }} onClick={() => handleRemoveOption(opt.id)}>
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          <button 
            className="btn-outline" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', borderStyle: 'dashed' }}
            onClick={handleAddOption}
          >
            <FiPlus /> New Label
          </button>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn-outline" onClick={onClose} style={{ marginBottom: 0 }}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default StatusEditorModal;
