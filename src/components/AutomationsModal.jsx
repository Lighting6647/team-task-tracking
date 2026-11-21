import React, { useState } from 'react';
import { FiX, FiPlus, FiZap, FiTrash2 } from 'react-icons/fi';
import { DEFAULT_AUTOMATION_RECIPES } from '../utils/automationEngine';

const TRIGGER_LABELS = {
  status_is: 'เมื่อสถานะเปลี่ยนเป็น',
  item_created: 'เมื่อสร้างงานใหม่ขึ้นในบอร์ด'
};

const TRIGGER_VALUE_LABELS = {
  done: 'Done (เสร็จสิ้น)',
  working: 'Working on it (กำลังทำ)',
  stuck: 'Stuck (ติดขัด)',
  '*': 'ทุกรายการ'
};

const ACTION_LABELS = {
  move_to_group: 'ย้ายงานไปยังกลุ่มงาน',
  notify: 'ส่งการแจ้งเตือนไปยัง',
  set_department: 'กำหนดแผนกเริ่มต้นเป็น'
};

const AutomationsModal = ({
  isOpen,
  onClose,
  recipes: propRecipes,
  onToggleRecipe,
  onDeleteRecipe,
  onAddRecipe
}) => {
  const [localRecipes, setLocalRecipes] = useState(DEFAULT_AUTOMATION_RECIPES);
  const recipes = propRecipes ?? localRecipes;

  const [showAddForm, setShowAddForm] = useState(false);
  const [triggerType, setTriggerType] = useState('status_is');
  const [triggerValue, setTriggerValue] = useState('stuck');
  const [actionType, setActionType] = useState('notify');
  const [actionValue, setActionValue] = useState('ผู้จัดการโปรเจกต์');

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleRecipe = (id) => {
    if (onToggleRecipe) {
      onToggleRecipe(id);
    } else {
      setLocalRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    }
  };

  const deleteRecipe = (id) => {
    if (onDeleteRecipe) {
      onDeleteRecipe(id);
    } else {
      setLocalRecipes((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleTriggerTypeChange = (nextType) => {
    setTriggerType(nextType);
    setTriggerValue(nextType === 'item_created' ? '*' : 'done');
  };

  const handleActionTypeChange = (nextAction) => {
    setActionType(nextAction);
    if (nextAction === 'move_to_group') setActionValue('Completed Tasks');
    else if (nextAction === 'set_department') setActionValue('dev');
    else setActionValue('ผู้จัดการโปรเจกต์');
  };

  const handleCreate = () => {
    const cleanVal = actionValue.trim() || 'Completed Tasks';
    const newRule = {
      id: `r_${Date.now()}`,
      triggerType,
      trigger: TRIGGER_LABELS[triggerType],
      triggerValue: triggerType === 'item_created' ? '*' : triggerValue,
      triggerVal: TRIGGER_VALUE_LABELS[triggerType === 'item_created' ? '*' : triggerValue] || triggerValue,
      actionType,
      action: ACTION_LABELS[actionType],
      actionValue: cleanVal,
      actionVal: cleanVal,
      active: true
    };
    if (onAddRecipe) {
      onAddRecipe(newRule);
    } else {
      setLocalRecipes((prev) => [...prev, newRule]);
    }
    setShowAddForm(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="automations-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '700px',
          background: '#1c2038',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: '#20243f',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3
              id="automations-modal-title"
              style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              ⚡ Automations Center (ระบบทำงานอัตโนมัติ)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ทำงานจริงอัตโนมัติเมื่อเปลี่ยนสถานะหรือสร้างงานใหม่ในบอร์ด
            </span>
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
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '460px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              เงื่อนไขที่มีอยู่ ({recipes.filter((r) => r.active).length}/{recipes.length} เปิดใช้งาน)
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                background: '#0085ff',
                color: '#fff',
                border: 'none',
                padding: '0.4rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FiPlus /> สร้างกฎอัตโนมัติใหม่
            </button>
          </div>

          {showAddForm && (
            <div style={{ background: '#291c45', border: '1px dashed #a259ff', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#a259ff' }}>⚡ เพิ่มกฎทำงานอัตโนมัติ (Custom Recipe)</h4>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem' }}>เมื่อ:</span>
                <select
                  aria-label="Trigger Type"
                  value={triggerType}
                  onChange={(e) => handleTriggerTypeChange(e.target.value)}
                  style={{ background: '#1c2038', border: '1px solid var(--border-color)', color: '#fff', padding: '0.4rem', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="status_is">เมื่อสถานะเปลี่ยนเป็น</option>
                  <option value="item_created">เมื่อสร้างงานใหม่ขึ้นในบอร์ด</option>
                </select>
                {triggerType === 'status_is' && (
                  <select
                    aria-label="Trigger Value"
                    value={triggerValue}
                    onChange={(e) => setTriggerValue(e.target.value)}
                    style={{ background: '#1c2038', border: '1px solid var(--border-color)', color: '#579bfc', padding: '0.4rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <option value="done">Done (เสร็จสิ้น)</option>
                    <option value="working">Working on it (กำลังทำ)</option>
                    <option value="stuck">Stuck (ติดขัด)</option>
                  </select>
                )}
                <span style={{ fontSize: '0.85rem' }}>ให้ทำ:</span>
                <select
                  aria-label="Action Type"
                  value={actionType}
                  onChange={(e) => handleActionTypeChange(e.target.value)}
                  style={{ background: '#1c2038', border: '1px solid var(--border-color)', color: '#fff', padding: '0.4rem', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="notify">ส่งการแจ้งเตือนไปยัง</option>
                  <option value="move_to_group">ย้ายงานไปยังกลุ่มงาน</option>
                  <option value="set_department">กำหนดแผนกเริ่มต้นเป็น</option>
                </select>
                {actionType === 'set_department' ? (
                  <select
                    aria-label="Action Department"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    style={{ background: '#1c2038', border: '1px solid var(--border-color)', color: '#00c875', padding: '0.4rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <option value="dev">Development (dev)</option>
                    <option value="design">Design (design)</option>
                    <option value="marketing">Marketing (marketing)</option>
                    <option value="finance">Finance (finance)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    aria-label="Action Target"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    placeholder={actionType === 'move_to_group' ? 'ชื่อกลุ่มเป้าหมาย เช่น Completed Tasks' : 'ชื่อผู้รับแจ้งเตือน'}
                    style={{ background: '#1c2038', border: '1px solid var(--border-color)', color: '#00c875', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', minWidth: '160px' }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  style={{ background: '#0085ff', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  บันทึกกฎนี้
                </button>
              </div>
            </div>
          )}

          {recipes.map((r) => (
            <div
              key={r.id}
              style={{
                background: '#242847',
                border: `1px solid ${r.active ? '#a259ff' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '12px',
                padding: '1.1rem 1.25rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, minWidth: '220px' }}>
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
                <button
                  type="button"
                  onClick={() => deleteRecipe(r.id)}
                  style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}
                  title="ลบกฎนี้"
                  aria-label="ลบกฎนี้"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', background: '#20243f', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-primary" onClick={onClose} style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', background: '#0085ff' }}>
            เรียบร้อย
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomationsModal;
