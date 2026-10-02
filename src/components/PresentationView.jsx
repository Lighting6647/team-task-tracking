import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlay, FiMaximize2, FiMinimize2, FiLayers, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const PresentationView = ({ board }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!board || board.type !== 'grid') {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h2>Presentation Mode requires a Table Board</h2>
      </div>
    );
  }

  // Generate slides from Groups and Items
  const slides = [];

  // Slide 0: Title Slide
  slides.push({
    type: 'title',
    title: board.title || 'Project Presentation',
    subtitle: `สไลด์นำเสนอโครงการ (MS PowerPoint Mode) • ${board.groups?.length || 0} กลุ่มงาน`,
    groupColor: board.color || '#0085ff'
  });

  // Group & Item slides
  (board.groups || []).forEach(group => {
    // Group intro slide
    slides.push({
      type: 'group',
      title: group.title,
      itemCount: group.items?.length || 0,
      color: group.color || '#579bfc',
      items: group.items || []
    });

    // Individual item slides for items with detailed content
    (group.items || []).forEach(item => {
      slides.push({
        type: 'item',
        title: item.title,
        groupTitle: group.title,
        color: group.color || '#579bfc',
        status: item.status || 'empty',
        owner: item.owner || 'Unassigned',
        date: item.date || 'No Date',
        department: item.department || '-',
        subitems: item.subitems || []
      });
    });
  });

  const activeSlide = slides[currentSlide] || slides[0];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: isFullscreen ? '100vh' : 'calc(100vh - 180px)', 
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 1,
        background: '#121426',
        borderRadius: isFullscreen ? 0 : '12px',
        border: isFullscreen ? 'none' : '1px solid var(--border-color)',
        overflow: 'hidden',
        color: '#fff'
      }}
    >
      {/* Top Presentation Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', background: '#1c2038', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ background: '#e2445c', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
            PowerPoint Mode
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{board.title}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            สไลด์ {currentSlide + 1} จาก {slides.length}
          </span>
          <button 
            onClick={toggleFullscreen} 
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-color)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
            {isFullscreen ? 'ออกจากเต็มจอ' : 'นำเสนอเต็มจอ'}
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
        
        {/* Slide Card Frame */}
        <div 
          style={{ 
            width: '100%', 
            maxWidth: '960px', 
            height: '100%', 
            maxHeight: '540px', 
            background: 'linear-gradient(145deg, #1f2340, #17192e)', 
            borderRadius: '16px', 
            border: `2px solid ${activeSlide.color || '#0085ff'}`, 
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', 
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Accent Line Top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: activeSlide.color || '#0085ff' }}></div>

          {/* Title Slide */}
          {activeSlide.type === 'title' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h1 style={{ fontSize: '2.75rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#fff' }}>
                {activeSlide.title}
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', margin: 0 }}>
                {activeSlide.subtitle}
              </p>
            </div>
          )}

          {/* Group Overview Slide */}
          {activeSlide.type === 'group' && (
            <div>
              <div style={{ fontSize: '0.85rem', color: activeSlide.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                Group Summary
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>
                {activeSlide.title}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>จำนวนงานในหมวดนี้</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: activeSlide.color }}>{activeSlide.itemCount} งาน</div>
                </div>
              </div>
            </div>
          )}

          {/* Item Detail Slide */}
          {activeSlide.type === 'item' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ background: activeSlide.color, color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {activeSlide.groupTitle}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    แผนก: {activeSlide.department}
                  </span>
                </div>

                <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 1.5rem 0', lineHeight: 1.3 }}>
                  {activeSlide.title}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>สถานะ (Status)</div>
                  <div style={{ fontWeight: 700, color: activeSlide.status === 'done' ? '#00c875' : activeSlide.status === 'working' ? '#fdab3d' : '#fff' }}>
                    {activeSlide.status === 'done' ? '✓ Done' : activeSlide.status === 'working' ? '⏳ Working on it' : '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ผู้รับผิดชอบ (Owner)</div>
                  <div style={{ fontWeight: 600 }}>{activeSlide.owner}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>กำหนดส่ง (Due Date)</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{activeSlide.date}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Navigation Bottom Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 2rem', background: '#1c2038', borderTop: '1px solid var(--border-color)' }}>
        <button 
          onClick={handlePrev} 
          disabled={currentSlide === 0}
          style={{ 
            background: currentSlide === 0 ? 'rgba(255,255,255,0.05)' : '#0085ff', 
            color: '#fff', 
            border: 'none', 
            padding: '0.5rem 1.25rem', 
            borderRadius: '6px', 
            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
            opacity: currentSlide === 0 ? 0.5 : 1
          }}
        >
          <FiChevronLeft size={18} /> ก่อนหน้า
        </button>

        {/* Slide Progress Dots */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '400px' }}>
          {slides.map((s, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: currentSlide === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentSlide === idx ? (s.color || '#0085ff') : 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={`Slide ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        <button 
          onClick={handleNext} 
          disabled={currentSlide === slides.length - 1}
          style={{ 
            background: currentSlide === slides.length - 1 ? 'rgba(255,255,255,0.05)' : '#0085ff', 
            color: '#fff', 
            border: 'none', 
            padding: '0.5rem 1.25rem', 
            borderRadius: '6px', 
            cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
            opacity: currentSlide === slides.length - 1 ? 0.5 : 1
          }}
        >
          ถัดไป <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PresentationView;
