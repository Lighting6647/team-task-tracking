import React, { useState, useRef, useEffect } from 'react';
import { FiGrid, FiLayers, FiPlusCircle, FiZap, FiMenu, FiCheck, FiCalendar, FiFileText, FiTv, FiList } from 'react-icons/fi';

const MobileBottomNav = ({
  activeBoard,
  viewType,
  onSelectView,
  onOpenSidebar,
  onQuickAdd,
  onToggleAi,
  isAiOpen,
  activeSpecialView,
  onSelectSpecialView
}) => {
  const [showViewPicker, setShowViewPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowViewPicker(false);
      }
    };
    if (showViewPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showViewPicker]);

  const VIEWS = [
    { id: 'table', label: 'Main Table', icon: <FiList size={16} /> },
    { id: 'kanban', label: 'Kanban', icon: <FiGrid size={16} /> },
    { id: 'gantt', label: 'Timeline', icon: <FiCalendar size={16} /> },
    { id: 'form', label: 'Form', icon: <FiFileText size={16} /> },
    { id: 'presentation', label: 'Presentation 🖥️', icon: <FiTv size={16} /> },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Quick Navigation">
      {/* View Switcher Popover Sheet */}
      {showViewPicker && (
        <div className="mobile-view-popover" ref={pickerRef} role="dialog" aria-label="เลือกมุมมอง (Switch View)">
          <div className="mobile-popover-header">
            <span>สลับมุมมองบอร์ด (Switch View)</span>
            <button 
              type="button"
              onClick={() => setShowViewPicker(false)} 
              className="mobile-popover-close"
              aria-label="ปิด"
            >
              ✕
            </button>
          </div>
          <div className="mobile-popover-list">
            {VIEWS.map(v => (
              <button
                key={v.id}
                type="button"
                className={`mobile-popover-item ${viewType === v.id && !activeSpecialView ? 'active' : ''}`}
                onClick={() => {
                  if (activeSpecialView) onSelectSpecialView(null);
                  onSelectView(v.id);
                  setShowViewPicker(false);
                }}
              >
                <span className="mobile-popover-icon">{v.icon}</span>
                <span className="mobile-popover-label">{v.label}</span>
                {viewType === v.id && !activeSpecialView && <FiCheck className="mobile-popover-check" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5 Primary Thumb Actions */}
      <div className="mobile-bottom-nav-inner">
        {/* 1. Sidebar Menu Trigger */}
        <button
          type="button"
          className="mobile-nav-item"
          onClick={onOpenSidebar}
          aria-label="เปิดเมนูนำทาง (Sidebar Menu)"
        >
          <div className="mobile-nav-icon-wrap">
            <FiMenu size={20} />
          </div>
          <span className="mobile-nav-label">เมนู</span>
        </button>

        {/* 2. Switch Views (Table / Kanban / Timeline) */}
        {activeBoard?.type === 'grid' && (
          <button
            type="button"
            className={`mobile-nav-item ${showViewPicker ? 'active' : ''}`}
            onClick={() => setShowViewPicker(prev => !prev)}
            aria-label="เปลี่ยนมุมมอง (Switch Views)"
          >
            <div className="mobile-nav-icon-wrap">
              <FiLayers size={20} />
            </div>
            <span className="mobile-nav-label">
              {viewType === 'table' ? 'ตาราง' : viewType === 'kanban' ? 'คัมบัง' : viewType === 'gantt' ? 'ไทม์ไลน์' : 'มุมมอง'}
            </span>
          </button>
        )}

        {/* 3. Center Hero Quick Add Button */}
        {activeBoard?.type === 'grid' && (
          <button
            type="button"
            className="mobile-nav-item-hero"
            onClick={onQuickAdd}
            aria-label="เพิ่มงานใหม่ทันที (Quick Add Task)"
          >
            <div className="mobile-hero-btn">
              <FiPlusCircle size={28} />
            </div>
            <span className="mobile-nav-label">เพิ่มงาน</span>
          </button>
        )}

        {/* 4. AI Copilot Toggle */}
        <button
          type="button"
          className={`mobile-nav-item ${isAiOpen ? 'active' : ''}`}
          onClick={onToggleAi}
          aria-label="เปิดผู้ช่วย AI Copilot"
        >
          <div className="mobile-nav-icon-wrap" style={{ color: isAiOpen ? '#a259ff' : undefined }}>
            <FiZap size={20} />
          </div>
          <span className="mobile-nav-label" style={{ color: isAiOpen ? '#a259ff' : undefined }}>AI ผู้ช่วย</span>
        </button>

        {/* 5. Special View (My Work) */}
        <button
          type="button"
          className={`mobile-nav-item ${activeSpecialView === 'my-work' ? 'active' : ''}`}
          onClick={() => {
            if (activeSpecialView === 'my-work') {
              onSelectSpecialView(null);
            } else {
              onSelectSpecialView('my-work');
            }
          }}
          aria-label="มุมมองงานของฉัน (My Work)"
        >
          <div className="mobile-nav-icon-wrap">
            <FiList size={20} />
          </div>
          <span className="mobile-nav-label">งานของฉัน</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
