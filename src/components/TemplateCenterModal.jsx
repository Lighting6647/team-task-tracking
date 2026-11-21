import React, { useState } from 'react';
import { FiX, FiCopy, FiGrid, FiPlus } from 'react-icons/fi';
import { BOARD_TEMPLATES } from '../utils/workspaceTemplates';

const TemplateCenterModal = ({ isOpen, onClose, onUseTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(BOARD_TEMPLATES.map((t) => t.category)))];
  const visible = selectedCategory === 'All'
    ? BOARD_TEMPLATES
    : BOARD_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        role="dialog"
        aria-label="Template Center"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          overflow: 'hidden',
          color: 'var(--text-primary)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <FiCopy size={18} color="#0073ea" />
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Template Center</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close templates" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid var(--border-color)',
                backgroundColor: selectedCategory === cat ? '#0073ea' : 'var(--bg-main)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {visible.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                gap: '0.85rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: `${tpl.color}22`, color: tpl.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiGrid size={17} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', backgroundColor: `${tpl.color}22`, color: tpl.color }}>
                    {tpl.badge}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{tpl.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{tpl.description}</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onUseTemplate(tpl);
                  onClose();
                }}
                className="btn-primary"
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.45rem 0.75rem', borderRadius: '8px', fontSize: '0.84rem' }}
              >
                <FiPlus size={15} /> ใช้เทมเพลตนี้
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateCenterModal;
