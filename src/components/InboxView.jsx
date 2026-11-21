import React, { useState, useMemo } from 'react';
import { FiInbox, FiBookmark, FiAtSign, FiMessageSquare, FiCheckCircle, FiExternalLink } from 'react-icons/fi';

const InboxView = ({ boards = [], notifications = [], onSelectBoard, onOpenItem }) => {
  const [tab, setTab] = useState('all'); // 'all' | 'mentioned' | 'bookmarked'
  const [boardFilter, setBoardFilter] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tracking_inbox_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('tracking_inbox_bookmarks', JSON.stringify(next));
      return next;
    });
  };

  const gridBoards = useMemo(
    () => boards.filter((b) => b.type === 'grid' && !b.isDeleted && !b.isArchived),
    [boards]
  );

  const feedItems = useMemo(() => {
    const entries = [];

    for (const b of gridBoards) {
      for (const g of b.groups || []) {
        for (const item of g.items || []) {
          for (const upd of item.updates || []) {
            entries.push({
              id: `upd-${item.id}-${upd.id}`,
              type: 'update',
              boardId: b.id,
              boardTitle: b.title,
              groupId: g.id,
              itemId: item.id,
              itemTitle: item.title,
              author: upd.author || 'Team Member',
              text: upd.text || '',
              timestamp: upd.timestamp || '',
              isMention: (upd.text || '').includes('@'),
            });
          }
          for (const act of (item.activityLog || []).slice(0, 3)) {
            entries.push({
              id: `act-${item.id}-${act.id}`,
              type: 'activity',
              boardId: b.id,
              boardTitle: b.title,
              groupId: g.id,
              itemId: item.id,
              itemTitle: item.title,
              author: act.actor || 'Automation',
              text: act.summary || act.action || 'อัปเดตรายการ',
              timestamp: act.timestamp || '',
              isMention: false,
            });
          }
        }
      }
    }

    for (const n of notifications) {
      entries.push({
        id: `notif-${n.id}`,
        type: 'notification',
        boardId: n.boardId || null,
        boardTitle: n.boardTitle || 'System Notification',
        groupId: n.groupId || null,
        itemId: n.itemId || null,
        itemTitle: n.title || 'แจ้งเตือนอัตโนมัติ',
        author: 'System',
        text: n.message || '',
        timestamp: n.timestamp || '',
        isMention: (n.message || '').includes('@'),
      });
    }

    return entries;
  }, [gridBoards, notifications]);

  const filtered = feedItems.filter((entry) => {
    if (boardFilter !== 'all' && entry.boardId !== boardFilter) return false;
    if (tab === 'mentioned' && !entry.isMention) return false;
    if (tab === 'bookmarked' && !bookmarkedIds.includes(entry.id)) return false;
    return true;
  });

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <FiInbox color="#0073ea" /> Update Feed (Inbox)
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              รวมคอมเมนต์ อัปเดตสถานะ และการแจ้งเตือนจากทุกบอร์ดไว้ในหน้าเดียว
            </p>
          </div>

          <select
            value={boardFilter}
            onChange={(e) => setBoardFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          >
            <option value="all">All boards in my feed</option>
            {gridBoards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          {[
            { id: 'all', label: `All updates (${feedItems.length})`, icon: <FiMessageSquare size={14} /> },
            { id: 'mentioned', label: 'I was mentioned', icon: <FiAtSign size={14} /> },
            { id: 'bookmarked', label: `Bookmarked (${bookmarkedIds.length})`, icon: <FiBookmark size={14} /> },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 0.2rem',
                background: 'none',
                border: 'none',
                borderBottom: tab === t.id ? '2px solid #0073ea' : '2px solid transparent',
                color: tab === t.id ? '#0073ea' : 'var(--text-muted)',
                fontWeight: tab === t.id ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Feed List */}
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
            <FiCheckCircle size={32} color="#00c875" style={{ marginBottom: '0.6rem' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>ยังไม่มีอัปเดตใหม่ในหมวดนี้</div>
            <div style={{ fontSize: '0.84rem' }}>เมื่อมีการคอมเมนต์หรือเปลี่ยนสถานะงานในบอร์ด รายการจะแสดงที่นี่อัตโนมัติ</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filtered.map((entry) => {
              const isSaved = bookmarkedIds.includes(entry.id);
              return (
                <div
                  key={entry.id}
                  style={{
                    padding: '1rem 1.15rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{entry.author}</strong>
                      <span style={{ fontSize: '0.76rem', padding: '0.12rem 0.5rem', borderRadius: '999px', backgroundColor: 'var(--bg-main)', color: '#0073ea' }}>
                        {entry.boardTitle}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {entry.itemTitle}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(entry.id)}
                        title={isSaved ? 'เอาออกจากที่คั่นไว้' : 'คั่นหน้าไว้'}
                        style={{ background: 'none', border: 'none', color: isSaved ? '#fdab3d' : 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        <FiBookmark size={15} />
                      </button>
                      {entry.boardId && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectBoard(entry.boardId);
                            if (entry.groupId && entry.itemId && onOpenItem) {
                              onOpenItem(entry.groupId, entry.itemId, entry.boardId);
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#0073ea', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}
                        >
                          เปิดดู <FiExternalLink size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{entry.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxView;
