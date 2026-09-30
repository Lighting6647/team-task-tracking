import React, { useState } from 'react';
import { FiVideo, FiCpu, FiCheckSquare, FiPlus, FiArrowRight, FiFileText } from 'react-icons/fi';

const AiNotetakerView = ({ boards, onAddTask }) => {
  const [notes, setNotes] = useState(
`การประชุมวางแผนโปรเจกต์ Pass App (ประจำสัปดาห์):
- สรุปความคืบหน้าระบบ Login ผ่านการทดสอบเรียบร้อยแล้ว
- มอบหมายทีม Backend ให้เชื่อมต่อระบบ Payment Gateway ให้เสร็จภายในวันที่ 15 ต.ค.
- ให้ทีม Design ส่งออก App Icon สำหรับ iOS และ Android ภายในสิ้นเดือนนี้
- ฝ่ายการเงินให้จัดเตรียมงบประมาณสำหรับค่า Server AWS ประจำเดือนหน้า`
  );

  const [extractedTasks, setExtractedTasks] = useState([
    { id: 'et1', title: 'เชื่อมต่อระบบ Payment Gateway (Backend)', status: 'working', department: 'dev' },
    { id: 'et2', title: 'ส่งออก App Icon สำหรับ iOS และ Android (Design)', status: 'working', department: 'design' },
    { id: 'et3', title: 'จัดเตรียมงบประมาณค่า Server AWS ประจำเดือนหน้า', status: 'empty', department: 'finance' }
  ]);

  const [selectedBoardId, setSelectedBoardId] = useState(
    boards.find(b => b.type === 'grid')?.id || ''
  );
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleExtract = () => {
    // Smart line-by-line extractor
    const lines = notes.split('\n');
    const newTasks = [];
    lines.forEach((line, index) => {
      const clean = line.replace(/^[-*•\d.]\s*/, '').trim();
      if (clean && (clean.includes('ให้') || clean.includes('มอบหมาย') || clean.includes('เตรียม') || clean.includes('เชื่อมต่อ') || clean.includes('ทำ'))) {
        newTasks.push({
          id: `et-${Date.now()}-${index}`,
          title: clean,
          status: 'working',
          department: clean.includes('Design') ? 'design' : clean.includes('เงิน') ? 'finance' : 'dev'
        });
      }
    });

    if (newTasks.length > 0) {
      setExtractedTasks(newTasks);
    }
  };

  const handleAddAllToBoard = () => {
    const targetBoard = boards.find(b => b.id === selectedBoardId);
    if (!targetBoard || !targetBoard.groups || targetBoard.groups.length === 0) return;
    const targetGroupId = targetBoard.groups[0].id;

    extractedTasks.forEach(task => {
      if (onAddTask) {
        onAddTask(targetGroupId, task.title);
      }
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div style={{ padding: '2rem 3rem', color: 'var(--text-main)', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#00c875' }}><FiVideo size={28} /></span>
          <span>AI Meeting Notetaker & Task Extractor</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          บันทึกการประชุม สรุปประเด็นสำคัญ และแปลงการตัดสินใจในการประชุมเป็น Task งานลงในบอร์ดอัตโนมัติด้วย AI
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Left: Meeting Notes Editor */}
        <div style={{ background: '#20243f', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFileText color="#579bfc" /> บันทึกการประชุม (Meeting Notes)
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>รองรับภาษาไทย / English</span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={12}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: '#181b34',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              resize: 'vertical',
              marginBottom: '1rem'
            }}
          />

          <button
            onClick={handleExtract}
            style={{
              background: 'linear-gradient(135deg, #00c875, #0085ff)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <FiCpu size={18} /> สกัด Action Items ด้วย AI (Extract Tasks)
          </button>
        </div>

        {/* Right: Extracted Tasks preview */}
        <div style={{ background: '#20243f', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiCheckSquare color="#00c875" /> รายการงานที่สกัดได้ ({extractedTasks.length} รายการ)
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              เลือกบอร์ดเป้าหมายเพื่อนำเข้า Task เหล่านี้เข้าสู่กระดานติดตามงาน
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {extractedTasks.map(task => (
              <div 
                key={task.id}
                style={{ 
                  background: '#181b34', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {task.title}
                </div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  background: task.department === 'design' ? '#c455de' : task.department === 'finance' ? '#fdab3d' : '#579bfc',
                  color: '#fff',
                  whiteSpace: 'nowrap'
                }}>
                  {task.department.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              เลือกบอร์ดปลายทางที่จะนำเข้า:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: '#181b34',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              >
                {boards.filter(b => b.type === 'grid').map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>

              <button
                onClick={handleAddAllToBoard}
                style={{
                  background: '#0085ff',
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {addedSuccess ? '✓ บันทึกเข้าบอร์ดแล้ว!' : 'นำเข้าสู่บอร์ด'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiNotetakerView;
