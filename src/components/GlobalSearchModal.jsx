import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FiSearch, FiX, FiGrid, FiFileText, FiLayout, FiCheckSquare, FiClock } from 'react-icons/fi';

const GlobalSearchModal = ({
  isOpen,
  onClose,
  boards = [],
  recentBoardIds = [],
  onSelectBoard,
  onOpenItem,
}) => {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all'); // 'all' | 'boards' | 'items' | 'docs'
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery('');
      setScope('all');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const activeBoards = useMemo(
    () => boards.filter((b) => !b.isDeleted && !b.isArchived),
    [boards]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchedBoards = [];
    const matchedDocs = [];
    const matchedItems = [];

    for (const b of activeBoards) {
      if (b.type === 'folder') continue;
      if (!q || b.title.toLowerCase().includes(q)) {
        if (b.type === 'doc') matchedDocs.push(b);
        else matchedBoards.push(b);
      }
      if (b.type === 'grid' && b.groups) {
        for (const g of b.groups) {
          for (const item of g.items || []) {
            const hay = `${item.title || ''} ${item.owner || ''} ${item.status || ''}`.toLowerCase();
            if (q && hay.includes(q)) {
              matchedItems.push({ board: b, group: g, item });
            }
          }
        }
      }
    }

    return { matchedBoards, matchedDocs, matchedItems };
  }, [activeBoards, query]);

  if (!isOpen) return null;

  const recentBoards = recentBoardIds
    .map((id) => activeBoards.find((b) => b.id === id))
    .filter(Boolean);

  const showBoards = scope === 'all' || scope === 'boards';
  const showItems = scope === 'all' || scope === 'items';
  const showDocs = scope === 'all' || scope === 'docs';
  const hasQuery = query.trim().length > 0;

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
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      <div
        role="dialog"
        aria-label="Search everything"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          overflow: 'hidden',
          color: 'var(--text-primary)',
        }}
      >
        {/* Search Input Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.9rem 1.1rem', borderBottom: '1px solid var(--border-color)' }}>
          <FiSearch size={18} color="#0073ea" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for anything... (บอร์ด, งาน, ผู้รับผิดชอบ, เอกสาร)"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.98rem',
            }}
          />
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            ESC
          </span>
          <button type="button" onClick={onClose} aria-label="Close search" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <FiX size={18} />
          </button>
        </div>

        {/* Scope Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.65rem 1.1rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'boards', label: `Boards (${results.matchedBoards.length})` },
            { id: 'items', label: `Items (${results.matchedItems.length})` },
            { id: 'docs', label: `Documents (${results.matchedDocs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScope(tab.id)}
              style={{
                padding: '0.28rem 0.7rem',
                borderRadius: '999px',
                border: '1px solid var(--border-color)',
                backgroundColor: scope === tab.id ? '#0073ea' : 'var(--bg-main)',
                color: scope === tab.id ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '55vh', overflowY: 'auto', padding: '0.75rem 0.5rem' }}>
          {!hasQuery && recentBoards.length > 0 && (
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FiClock size={12} /> Recently visited
              </div>
              {recentBoards.slice(0, 4).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onSelectBoard(b.id);
                    onClose();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.75rem',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {b.type === 'dashboard' ? <FiLayout color="#0073ea" /> : b.type === 'doc' ? <FiFileText color="#c455de" /> : <FiGrid color="#00c875" />}
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{b.title}</span>
                </button>
              ))}
            </div>
          )}

          {showBoards && results.matchedBoards.length > 0 && (
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Boards & Dashboards
              </div>
              {results.matchedBoards.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onSelectBoard(b.id);
                    onClose();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                    {b.type === 'dashboard' ? <FiLayout color="#0073ea" /> : <FiGrid color={b.color || '#00c875'} />}
                    {b.title}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{b.type}</span>
                </button>
              ))}
            </div>
          )}

          {showItems && results.matchedItems.length > 0 && (
            <div style={{ marginBottom: '0.8rem' }}>
              <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Items ({results.matchedItems.length})
              </div>
              {results.matchedItems.slice(0, 15).map(({ board, group, item }) => (
                <button
                  key={`${board.id}-${item.id}`}
                  type="button"
                  onClick={() => {
                    onSelectBoard(board.id);
                    if (onOpenItem) onOpenItem(group.id, item.id, board.id);
                    onClose();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.75rem',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
                    <FiCheckSquare color="#579bfc" />
                    <span>
                      <strong>{item.title}</strong>
                      <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {board.title} → {group.title}
                      </span>
                    </span>
                  </span>
                  {item.owner && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.owner}</span>}
                </button>
              ))}
            </div>
          )}

          {showDocs && results.matchedDocs.length > 0 && (
            <div style={{ marginBottom: '0.4rem' }}>
              <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Documents
              </div>
              {results.matchedDocs.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    onSelectBoard(d.id);
                    onClose();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.55rem 0.75rem',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <FiFileText color="#c455de" />
                  <span style={{ fontSize: '0.9rem' }}>{d.title}</span>
                </button>
              ))}
            </div>
          )}

          {hasQuery &&
            results.matchedBoards.length === 0 &&
            results.matchedItems.length === 0 &&
            results.matchedDocs.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                ไม่พบผลลัพธ์สำหรับ &quot;{query}&quot;
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
