import React, { useState } from 'react';
import { FiX, FiCheck, FiRefreshCw, FiGlobe, FiMail, FiMessageSquare, FiDatabase, FiCloud } from 'react-icons/fi';

const INTEGRATIONS = [
  {
    id: 'line',
    name: 'LINE Notify / Slack',
    category: 'Messaging',
    icon: '💬',
    desc: 'ส่งข้อความแจ้งเตือนเข้ากลุ่ม LINE หรือ Slack อัตโนมัติเมื่อสถานะงานเปลี่ยนเป็น Done หรือ Stuck',
    active: true,
    webhook: 'https://notify-api.line.me/api/notify'
  },
  {
    id: 'email',
    name: 'Email Notification (SMTP)',
    category: 'Email',
    icon: '📧',
    desc: 'ส่งอีเมลแจ้งเตือนไปยังผู้รับผิดชอบเมื่อถูกมอบหมายงานใหม่ หรือใกล้วันกำหนดส่ง',
    active: true,
    webhook: 'smtp://mail.organization.com'
  },
  {
    id: 'excel',
    name: 'Microsoft Excel Live Sync',
    category: 'MS Office 365',
    icon: '📊',
    desc: 'ซิงค์ข้อมูลตารางจากบอร์ดนี้ไปยังไฟล์ MS Excel Web (Office 365) แบบ Real-time',
    active: true,
    webhook: 'https://graph.microsoft.com/v1.0/me/drive/items'
  },
  {
    id: 'gdrive',
    name: 'Google Drive / OneDrive Sync',
    category: 'Cloud Storage',
    icon: '📁',
    desc: 'สำรองข้อมูลเอกสาร MS Word (Document Editor) และไฟล์แนบเข้า Cloud Storage อัตโนมัติทุกวัน',
    active: false,
    webhook: ''
  }
];

const IntegrationsModal = ({ isOpen, onClose }) => {
  const [items, setItems] = useState(INTEGRATIONS);
  const [testingId, setTestingId] = useState(null);
  const [testSuccess, setTestSuccess] = useState(null);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleIntegration = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, active: !item.active } : item));
  };

  const handleTestConnection = (id) => {
    setTestingId(id);
    setTestSuccess(null);
    setTimeout(() => {
      setTestingId(null);
      setTestSuccess(id);
      setTimeout(() => setTestSuccess(null), 2500);
    }, 1000);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="integrations-modal-title"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
    >
      <div className="modal-content" style={{ width: '100%', maxWidth: '680px', background: '#1c2038', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', overflow: 'hidden', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#20243f', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 id="integrations-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔌 Integrations Center (การเชื่อมต่อระบบภายนอก)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>เชื่อมต่อบอร์ดนี้เข้ากับ LINE, Email, MS Excel และ Cloud Storage</span>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="ปิดหน้าต่าง Integrations"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <FiX size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Integration List */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '480px', overflowY: 'auto' }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#242847', border: `1px solid ${item.active ? '#579bfc' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '2rem', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                {item.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{item.name}</h4>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={item.active} 
                      onChange={() => toggleIntegration(item.id)}
                      style={{ cursor: 'pointer', transform: 'scale(1.3)' }} 
                    />
                    <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: item.active ? '#00c875' : 'var(--text-muted)', fontWeight: 600 }}>
                      {item.active ? 'เปิดใช้งาน (ACTIVE)' : 'ปิดใช้งาน'}
                    </span>
                  </label>
                </div>

                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {item.desc}
                </p>

                {item.active && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      value={item.webhook} 
                      readOnly 
                      style={{ flex: 1, background: '#1c2038', border: '1px solid var(--border-color)', color: 'rgba(255,255,255,0.7)', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', outline: 'none' }} 
                    />
                    <button
                      onClick={() => handleTestConnection(item.id)}
                      disabled={testingId === item.id}
                      style={{ background: testSuccess === item.id ? '#00c875' : '#579bfc', color: '#fff', border: 'none', padding: '0.35rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {testingId === item.id ? <FiRefreshCw className="spin" /> : testSuccess === item.id ? <FiCheck /> : 'ทดสอบการเชื่อมต่อ'}
                      {testSuccess === item.id ? 'สำเร็จ ✓' : ''}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', background: '#20243f', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={onClose} style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', background: '#0085ff' }}>
            เรียบร้อย
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsModal;
