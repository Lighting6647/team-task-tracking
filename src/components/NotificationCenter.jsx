import React, { useState, useRef, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
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

  // Generated Notifications from active boards
  const notifications = [
    {
      id: 1,
      title: '⏰ เตือนกำหนดส่งงาน',
      desc: 'งาน "ระบบ Login & Authentication" ในบอร์ด Pass App ถึงกำหนดส่งวันนี้',
      time: '10 นาทีที่แล้ว',
      type: 'warning',
      read: false
    },
    {
      id: 2,
      title: '📋 มอบหมายงานใหม่',
      desc: 'คุณได้รับการมอบหมายงาน "ออกแบบ UI/UX หน้า Home" โดย Dev Team',
      time: '1 ชั่วโมงที่แล้ว',
      type: 'info',
      read: false
    },
    {
      id: 3,
      title: '📄 อัปเดตเอกสาร MS Word',
      desc: 'เอกสาร "ข้อเสนอโครงการ Pass App" ได้รับการแก้ไขล่าสุดโดยผู้ดูแลระบบ',
      time: '3 ชั่วโมงที่แล้ว',
      type: 'success',
      read: false
    }
  ];

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0);
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button 
        className="icon-btn" 
        onClick={handleOpen} 
        style={{ position: 'relative', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
        title="การแจ้งเตือน (Notifications)"
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
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
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
            background: '#1c2038', 
            border: '1px solid var(--border-color)', 
            borderRadius: '12px', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)', 
            zIndex: 1000, 
            overflow: 'hidden' 
          }}
        >
          <div style={{ padding: '0.75rem 1rem', background: '#20243f', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>ศูนย์การแจ้งเตือน (Notifications)</span>
            <span style={{ fontSize: '0.75rem', color: '#00c875', cursor: 'pointer' }}>อ่านทั้งหมด ✓</span>
          </div>

          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {notifications.map(n => (
              <div 
                key={n.id} 
                style={{ 
                  padding: '0.75rem 1rem', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  gap: '0.75rem', 
                  background: n.read ? 'transparent' : 'rgba(87, 155, 252, 0.05)' 
                }}
              >
                <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>
                  {n.type === 'warning' ? '⏰' : n.type === 'success' ? '📄' : '📋'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', marginBottom: '2px' }}>{n.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.desc}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{n.time}</div>
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
