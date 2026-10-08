import React, { useState } from 'react';
import { FiX, FiPlus, FiZap, FiTrash2 } from 'react-icons/fi';

const INITIAL_RECIPES = [
  {
    id: 'r1',
    trigger: 'เมื่อสถานะเปลี่ยนเป็น',
    triggerVal: 'Done (เสร็จสิ้น)',
    action: 'ย้ายงานไปยังกลุ่มงาน',
    actionVal: 'Completed Tasks',
    active: true
  },
  {
    id: 'r2',
    trigger: 'เมื่อถึงกำหนดส่ง (Due Date)',
    triggerVal: 'ล่วงหน้า 1 วัน',
    action: 'ส่งการแจ้งเตือนไปยัง',
    actionVal: 'ผู้รับผิดชอบงาน (Assignee)',
    active: true
  },
  {
    id: 'r3',
    trigger: 'เมื่อสร้างงานใหม่ขึ้นในบอร์ด',
    triggerVal: 'ทุกรายการ',
    action: 'กำหนดแผนกเริ่มต้นเป็น',
    actionVal: 'ฝ่ายพัฒนาซอฟต์แวร์ (dev)',
    active: true
  }
];

const AutomationsModal = ({ isOpen, onClose }) => {
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrigger, setNewTrigger] = useState('เมื่อสถานะเปลี่ยนเป็น');
  const [newAction, setNewAction] = useState('ส่งการแจ้งเตือนไปยัง');

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleRecipe = (id) => {
    setRecipes(recipes.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRecipe = (id) => {
    setRecipes(recipes.filter(r => r.id !== id));
  };

  const handleCreate = () => {
    const newRule = {
      id: `r_${Date.now()}`,
      trigger: newTrigger,
      triggerVal: 'Stuck (ติดขัด)',
      action: newAction,
      actionVal: 'ผู้จัดการโปรเจกต์',
      active: true
    };
    setRecipes([...recipes, newRule]);
    setShowAddForm(false);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="automations-modal-title"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
    >
      <div className="modal-content" style={{ width: '100%', maxWidth: '680px', background: '#1c2038', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', overflow: 'hidden', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#20243f', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 id="automations-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚡ Automations Center (ระบบทำงานอัตโนมัติ)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ตั้งค่าเงื่อนไขการทำงานอัตโนมัติภายในบอร์ดเพื่อลดขั้นตอนซ้ำซ้อน</span>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="ปิดหน้าต่าง Automations"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <FiX size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Recipe List */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '440px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>เงื่อนไขที่มีอยู่ ({recipes.length} กฎ)</span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{ background: '#0085ff', color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FiPlus /> สร้างกฎอัตโนมัติใหม่
            </button>
          </div>

          {/* Add New Automation Rule Form */}
          {showAddForm && (
            <div style={{ background: '#291c45', border: '1px dashed #a259ff', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#a259ff' }}>⚡ เพิ่มกฎทำงานอัตโนมัติ (Custom Recipe)</h4>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem' }}>เมื่อ:</span>
                <select value={newTrigger} onChange={(e) => setNewTrigger(e.target.value)} style={{ background: '#1c2038', border: '1px solid var(--border-color)', color: '#fff', padding: '0.4rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <option value="เมื่อสถานะเปลี่ยนเป็น">เมื่อสถานะเปลี่ยนเป็น</option>
                  <option value="เมื่อถึงกำหนดส่ง (Due Date)">เมื่อถึงกำหนดส่ง (Due Date)</option>
                  <option value="เมื่อสร้างงานใหม่ขึ้นในบอร์ด">เมื่อสร้างงานใหม่ขึ้นในบอร์ด</option>
                </select>
                <span style={{ fontSize: '0.85rem' }}>ให้ทำ:</span>
                <select value={newAction} onChange={(e) => setNewAction(e.target.value)} style={{ background: '#1c2038', border: '1px solid var(--border-color)', color: '#fff', padding: '0.4rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <option value="ส่งการแจ้งเตือนไปยัง">ส่งการแจ้งเตือนไปยัง</option>
                  <option value="ย้ายงานไปยังกลุ่มงาน">ย้ายงานไปยังกลุ่มงาน</option>
                  <option value="กำหนดแผนกเริ่มต้นเป็น">กำหนดแผนกเริ่มต้นเป็น</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>ยกเลิก</button>
                <button onClick={handleCreate} style={{ background: '#0085ff', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>บันทึกกฎนี้</button>
              </div>
            </div>
          )}

          {recipes.map(r => (
            <div key={r.id} style={{ background: '#242847', border: `1px solid ${r.active ? '#a259ff' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1 }}>
                <div style={{ background: 'rgba(162, 89, 255, 0.15)', color: '#a259ff', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                  <FiZap size={18} />
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{r.trigger}: </span>
                  <strong style={{ color: '#579bfc' }}>{r.triggerVal}</strong>
                  <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>➔</span>
                  <span style={{ color: 'var(--text-muted)' }}>{r.action}: </span>
                  <strong style={{ color: '#00c875' }}>{r.actionVal}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={r.active} 
                    onChange={() => toggleRecipe(r.id)}
                    style={{ cursor: 'pointer', transform: 'scale(1.3)' }} 
                  />
                  <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: r.active ? '#00c875' : 'var(--text-muted)', fontWeight: 600 }}>
                    {r.active ? 'เปิดใช้งาน' : 'ปิด'}
                  </span>
                </label>
                <button onClick={() => deleteRecipe(r.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer' }} title="ลบกฎนี้">
                  <FiTrash2 size={16} />
                </button>
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

export default AutomationsModal;
