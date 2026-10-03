import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiUpload, FiCreditCard, FiSliders, FiSave, FiImage, FiInfo, FiTrash2 } from 'react-icons/fi';

const SettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('payment'); // 'payment' | 'general'
  const [accountName, setAccountName] = useState(() => localStorage.getItem('qr_account_name') || 'บริษัท พาส แอป จำกัด');
  const [promptPayId, setPromptPayId] = useState(() => localStorage.getItem('qr_promptpay_id') || '081-234-5678');
  const [bankName, setBankName] = useState(() => localStorage.getItem('qr_bank_name') || 'ธนาคารกสิกรไทย (KBANK)');
  const [qrImageUrl, setQrImageUrl] = useState(() => localStorage.getItem('qr_image_url') || '');
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('company_name') || 'Main Workspace');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setQrImageUrl(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem('qr_account_name', accountName);
    localStorage.setItem('qr_promptpay_id', promptPayId);
    localStorage.setItem('qr_bank_name', bankName);
    localStorage.setItem('qr_image_url', qrImageUrl);
    localStorage.setItem('company_name', companyName);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const removeQrImage = () => {
    setQrImageUrl('');
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '680px', background: '#1c2038', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', overflow: 'hidden', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#20243f', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚙️ ตั้งค่าระบบ (Settings Center)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>จัดการข้อมูล QR Code รับชำระเงิน และการตั้งค่าทั่วไปขององค์กร</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ background: '#17192e', borderBottom: '1px solid var(--border-color)', display: 'flex', padding: '0 1.5rem' }}>
          <button 
            onClick={() => setActiveTab('payment')}
            style={{ padding: '0.75rem 1.25rem', background: 'transparent', color: activeTab === 'payment' ? '#0085ff' : 'var(--text-muted)', border: 'none', borderBottom: activeTab === 'payment' ? '3px solid #0085ff' : 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiCreditCard size={16} /> QR Code ชำระเงิน
          </button>
          <button 
            onClick={() => setActiveTab('general')}
            style={{ padding: '0.75rem 1.25rem', background: 'transparent', color: activeTab === 'general' ? '#0085ff' : 'var(--text-muted)', border: 'none', borderBottom: activeTab === 'general' ? '3px solid #0085ff' : 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiSliders size={16} /> ตั้งค่าทั่วไป
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', maxHeight: '460px', overflowY: 'auto' }}>
          
          {/* PAYMENT QR CODE TAB */}
          {activeTab === 'payment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ background: 'rgba(87, 155, 252, 0.08)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid rgba(87, 155, 252, 0.2)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <FiInfo color="#579bfc" size={18} />
                <span>คุณสามารถอัปโหลดรูปภาพ QR Code พร้อมเพย์ หรือกรอกข้อมูลบัญชีเพื่อใช้แสดงในระบบชำระเงินได้ที่นี่</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                
                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                      ชื่อบัญชีผู้รับเงิน (Account Name)
                    </label>
                    <input 
                      type="text" 
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="เช่น บริษัท พาส แอป จำกัด"
                      style={{ width: '100%', background: '#242847', border: '1px solid var(--border-color)', color: '#fff', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                      เบอร์พร้อมเพย์ / เลขบัญชี (PromptPay ID)
                    </label>
                    <input 
                      type="text" 
                      value={promptPayId}
                      onChange={(e) => setPromptPayId(e.target.value)}
                      placeholder="เช่น 081-234-5678 หรือ เลขนิติบุคคล"
                      style={{ width: '100%', background: '#242847', border: '1px solid var(--border-color)', color: '#fff', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                      ชื่อธนาคาร (Bank Name)
                    </label>
                    <input 
                      type="text" 
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="เช่น ธนาคารกสิกรไทย"
                      style={{ width: '100%', background: '#242847', border: '1px solid var(--border-color)', color: '#fff', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                      อัปโหลดรูปภาพ QR Code
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <label style={{ flex: 1, background: '#0085ff', color: '#fff', padding: '0.5rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <FiUpload size={15} /> อัปโหลดรูป QR Code
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      </label>
                      {qrImageUrl && (
                        <button onClick={removeQrImage} style={{ background: 'rgba(226,68,92,0.2)', border: '1px solid #e2445c', color: '#e2445c', padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer' }} title="ลบรูป">
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div style={{ background: '#242847', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#00c875', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                    ตัวอย่างสแกนชำระเงิน (Live Preview)
                  </div>

                  <div style={{ width: '150px', height: '150px', background: '#fff', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    {qrImageUrl ? (
                      <img src={qrImageUrl} alt="Payment QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ color: '#888', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <FiImage size={32} color="#ccc" />
                        <span>ยังไม่ได้เลือกรูป QR Code</span>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{accountName || 'ชื่อบัญชี'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#579bfc', fontWeight: 600 }}>{promptPayId || '08X-XXX-XXXX'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{bankName}</div>
                </div>
              </div>
            </div>
          )}

          {/* GENERAL SETTINGS TAB */}
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                  ชื่อองค์กร / Workspace Name
                </label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', background: '#242847', border: '1px solid var(--border-color)', color: '#fff', padding: '0.55rem 0.75rem', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', background: '#20243f', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#00c875', opacity: savedSuccess ? 1 : 0, transition: 'opacity 0.3s', fontWeight: 600 }}>
            บันทึกการตั้งค่าเรียบร้อยแล้ว ✓
          </span>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
              ยกเลิก
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSave}
              style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', background: '#0085ff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiSave size={15} /> บันทึกข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
