import React, { useState } from 'react';
import { FiTrash2, FiArchive, FiRotateCcw, FiGrid, FiFileText, FiLayout, FiFolder } from 'react-icons/fi';

const TrashArchiveView = ({
  boards = [],
  initialTab = 'trash',
  onRestoreBoard,
  onPermanentDeleteBoard,
  onUnarchiveBoard,
}) => {
  const [tab, setTab] = useState(initialTab); // 'trash' | 'archive'

  const trashed = boards.filter((b) => b.isDeleted);
  const archived = boards.filter((b) => b.isArchived && !b.isDeleted);
  const list = tab === 'trash' ? trashed : archived;

  const renderIcon = (type) => {
    if (type === 'dashboard') return <FiLayout color="#0073ea" />;
    if (type === 'doc') return <FiFileText color="#c455de" />;
    if (type === 'folder') return <FiFolder color="#fdab3d" />;
    return <FiGrid color="#00c875" />;
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {tab === 'trash' ? <FiTrash2 color="#e2445c" /> : <FiArchive color="#fdab3d" />}
          {tab === 'trash' ? 'Recycle Bin (ถังขยะ)' : 'Archive (คลังเก็บถาวร)'}
        </h1>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          กู้คืนบอร์ด เอกสาร หรือโฟลเดอร์ที่ลบ/จัดเก็บไว้ได้ตลอดเวลา
        </p>

        <div style={{ display: 'flex', gap: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setTab('trash')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 0.2rem',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'trash' ? '2px solid #e2445c' : '2px solid transparent',
              color: tab === 'trash' ? '#e2445c' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FiTrash2 size={14} /> Trash ({trashed.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('archive')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 0.2rem',
              background: 'none',
              border: 'none',
              borderBottom: tab === 'archive' ? '2px solid #fdab3d' : '2px solid transparent',
              color: tab === 'archive' ? '#fdab3d' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FiArchive size={14} /> Archive ({archived.length})
          </button>
        </div>

        {list.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            {tab === 'trash' ? 'Your bin is empty — ถังขยะว่างเปล่า' : 'No archived boards — ยังไม่มีบอร์ดที่จัดเก็บ'}
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
            {list.map((b, idx) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.1rem',
                  borderBottom: idx < list.length - 1 ? '1px solid var(--border-color)' : 'none',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                  {renderIcon(b.type)}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{b.title}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{b.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => (tab === 'trash' ? onRestoreBoard(b.id) : onUnarchiveBoard(b.id))}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.8rem' }}
                  >
                    <FiRotateCcw size={13} /> กู้คืน (Restore)
                  </button>
                  {tab === 'trash' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`ลบ "${b.title}" ถาวร? ไม่สามารถกู้คืนได้`)) {
                          onPermanentDeleteBoard(b.id);
                        }
                      }}
                      style={{
                        padding: '0.35rem 0.7rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(226, 68, 92, 0.4)',
                        backgroundColor: 'rgba(226, 68, 92, 0.12)',
                        color: '#e2445c',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      ลบถาวร
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashArchiveView;
