import React, { useState, useRef, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import StatusEditorModal from './StatusEditorModal';

const StatusDropdown = ({ statusId, statusOptions, setStatusOptions, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find current status object or fallback to empty
  const currentStatus = statusOptions.find(s => s.id === statusId) || statusOptions.find(s => s.id === 'empty') || statusOptions[0] || { id: 'empty', label: '', color: '#c4c4c4' };

  const handleSelect = (id) => {
    onStatusChange(id);
    setIsOpen(false);
  };

  const getTextColor = (bgColor) => {
    // Determine text color based on background luminance for better contrast
    // Simple heuristic: if it's light grey (#c4c4c4), transparent text is used in current design,
    // but for any actual color, white text is usually fine.
    if (bgColor === '#c4c4c4') return 'transparent';
    return 'white';
  };

  return (
    <>
      <div style={{ width: '100%', height: '100%', position: 'relative' }} ref={dropdownRef}>
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '38px',
            backgroundColor: currentStatus.color, 
            color: getTextColor(currentStatus.color),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500
          }}
          className="status-cell-hover"
          onClick={() => setIsOpen(!isOpen)}
        >
          {currentStatus.label}
        </div>
        
        {isOpen && (
          <div 
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '180px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 100,
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            {statusOptions.map(opt => (
              <div 
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                style={{
                  backgroundColor: opt.color,
                  color: getTextColor(opt.color),
                  padding: '0.5rem',
                  textAlign: 'center',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  minHeight: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                className="status-option-hover"
              >
                {opt.label}
              </div>
            ))}
            
            <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.25rem 0' }} />
            
            <button 
              className="btn-outline" 
              style={{ width: '100%', padding: '0.25rem', marginBottom: 0, border: 'none', justifyContent: 'center' }}
              onClick={() => { setIsEditorOpen(true); setIsOpen(false); }}
            >
              <FiEdit2 size={14} style={{ marginRight: '0.5rem' }} /> Edit Labels
            </button>
          </div>
        )}
      </div>

      {isEditorOpen && (
        <StatusEditorModal 
          statusOptions={statusOptions}
          setStatusOptions={setStatusOptions}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </>
  );
};

export default StatusDropdown;
