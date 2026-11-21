import React, { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import { INITIAL_NOTIFICATIONS } from '../utils/automationEngine';

const NotificationCenter = ({ notifications: propNotifications, onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifications = propNotifications ?? localNotifications;
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    if (onMarkAllRead) {
      onMarkAllRead();
    } else {
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        type="button"
        className="icon-btn"
        onClick={handleOpen}
        style={{ position: 'relative', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
        title="การแจ้งเตือน (Notifications)"
        aria-label="การแจ้งเตือน (Notifications)"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#e2445c',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              minWidth: '16px',
              height: '16px',
              padding: '0 3px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '120%',
            right: 0,
            width: '320px',
            maxWidth: '90vw',
            background: '#1c2038',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#20243f',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>ศูนย์การแจ้งเตือน (Notifications)</span>
            <button
              type="button"
              onClick={markAllRead}
              style={{ background: 'transparent', border: 'none', fontSize: '0.75rem', color: '#00c875', cursor: 'pointer', fontWeight: 600 }}
            >
              อ่านทั้งหมด ✓
            </button>
          </div>

          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  gap: '0.75rem',
                  background: n.read ? 'transparent' : 'rgba(87, 155, 252, 0.06)'
                }}
              >
                <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>
                  {n.type === 'warning' ? '⏰' : n.type === 'success' ? '📄' : '📋'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', marginBottom: '2px' }}>{n.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '4px' }}>{n.desc}</div>
                  <div style={{ fontSize: '0.7rem', color: '#579bfc' }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
