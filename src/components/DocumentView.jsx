import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiFileText, FiCheck, FiRefreshCw, FiX, FiPrinter, FiFile, FiCopy, FiInfo, FiLayout, FiMaximize } from 'react-icons/fi';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const TEMPLATES = [
  {
    name: '📄 ข้อเสนอโครงการ (Project Proposal)',
    content: `<h1>📄 เอกสารข้อเสนอโครงการ (Project Proposal)</h1>
<p><strong>ชื่อโครงการ:</strong> พัฒนาระบบติดตามงานแบบเรียลไทม์ | <strong>วันที่:</strong> ${new Date().toLocaleDateString('th-TH')}</p>
<hr/>
<h2>1. วัตถุประสงค์ (Objectives)</h2>
<p>เพื่อยกระดับการทำงานร่วมกันของทีม เพิ่มความโปร่งใส และลดระยะเวลาในการติดตามสถานะโปรเจกต์</p>

<h2>2. ขอบเขตงาน (Scope of Work)</h2>
<ul>
  <li>รองรับการจัดการบอร์ดงานหลายรูปแบบ (Main Table, Kanban, Timeline, Form)</li>
  <li>ระบบแจ้งเตือนและติดตามสถานะอัตโนมัติ</li>
  <li>รองรับการเชื่อมต่อข้อมูลกับระบบภายนอก</li>
</ul>

<h2>3. งบประมาณและไทม์ไลน์</h2>
<blockquote style="background: rgba(87, 155, 252, 0.1); padding: 10px; border-left: 4px solid #579bfc;">
  <p>ระยะเวลาดำเนินการ: 4 สัปดาห์ | งบประมาณประเมิน: 150,000 บาท</p>
</blockquote>`
  },
  {
    name: '📝 รายงานการประชุม (Meeting Minutes)',
    content: `<h1>📝 บันทึกรายงานการประชุม (Meeting Minutes)</h1>
<p><strong>เรื่อง:</strong> การติดตามความคืบหน้าประจำสัปดาห์ | <strong>ประธานการประชุม:</strong> ทีมบริหารโปรเจกต์</p>
<hr/>
<h2>1. สรุปประเด็นการหารือ</h2>
<p>ที่ประชุมได้ร่วมกันสอบทานสถานะของงานแต่ละแผนก และเห็นชอบร่วมกันในแผนการดำเนินงานระยะถัดไป</p>

<h2>2. มติที่ประชุม & Action Items</h2>
<ul>
  <li>[ ] ฝ่ายพัฒนาซอฟต์แวร์: ดำเนินการทดสอบระบบก่อนขึ้นใช้งานจริง</li>
  <li>[ ] ฝ่ายการตลาด: จัดเตรียมสื่อประชาสัมพันธ์สำหรับวันเปิดตัว</li>
</ul>`
  },
  {
    name: '📋 ข้อกำหนดความต้องการระบบ (PRD)',
    content: `<h1>📋 เอกสารข้อกำหนดความต้องการระบบ (Product Requirement Document)</h1>
<p><strong>เวอร์ชัน:</strong> 1.0 | <strong>สถานะ:</strong> DRAFT</p>
<hr/>
<h2>1. ภาพรวมคุณสมบัติ (Feature Overview)</h2>
<p>ระบบเอกสาร (Document Editor) สไตล์ Microsoft Office / Monday Docs สำหรับสร้าง แก้ไข และแชร์ข้อมูลในทีม</p>

<h2>2. ความสามารถหลัก (Key Capabilities)</h2>
<ul>
  <li>Rich Text Formatting (ตัวหนา, ตัวเอียง, จัดหัวข้อ, ใส่สีข้อความ)</li>
  <li>ระบบบันทึกข้อมูลอัตโนมัติ (Auto-save) และปุ่มพิมพ์เอกสาร</li>
  <li>รองรับแท็กรายการ ตาราง และโควทคำพูด</li>
</ul>`
  }
];

const DocumentView = ({ board, updateDocument, onClose }) => {
  const [content, setContent] = useState(board.content || '');
  const [saveStatus, setSaveStatus] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [viewMode, setViewMode] = useState('a4'); // 'a4' | 'full'
  const timeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  // Load content when switching boards
  useEffect(() => {
    setContent(board.content || '');
    isFirstRender.current = true;
  }, [board.id]);

  // Auto-save logic
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    setSaveStatus('Saving...');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      try {
        updateDocument(board.id, content);
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        setSaveStatus('Error saving');
        console.error(error);
      }
    }, 1500); // Debounce 1.5s
    
    return () => clearTimeout(timeoutRef.current);
  }, [content, board.id]);

  const handleManualSave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    try {
      updateDocument(board.id, content);
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setSaveStatus('Error saving');
      console.error(error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${board.title || 'Document'}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1, h2, h3 { color: #111; }
            blockquote { background: #f0f4f8; padding: 10px 15px; border-left: 4px solid #0073ea; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const applyTemplate = (tplContent) => {
    if (content && content.trim() !== '<p><br></p>') {
      if (!window.confirm('การนำเข้าเทมเพลตจะเขียนทับเนื้อหาเดิม คุณต้องการดำเนินการต่อหรือไม่?')) {
        return;
      }
    }
    setContent(tplContent);
    setShowTemplates(false);
  };

  // Compute Stats
  const plainText = content.replace(/<[^>]+>/g, '').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  };

  return (
    <div className="document-view-container" style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--text-main)' }}>
      
      {/* Office Ribbon / Header Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: '#20243f', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.75rem 1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--accent-purple)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiFileText size={20} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{board.title || 'Document Editor'}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiInfo size={12} /> MS Word Document Editor (บันทึกอัตโนมัติ)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* View Mode Toggle */}
          <div style={{ background: '#17192e', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex' }}>
            <button
              onClick={() => setViewMode('a4')}
              style={{
                background: viewMode === 'a4' ? '#0085ff' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: viewMode === 'a4' ? 600 : 400
              }}
              title="มุมมองหน้ากระดาษ A4 (สไตล์ MS Word)"
            >
              📄 หน้า A4 Word
            </button>
            <button
              onClick={() => setViewMode('full')}
              style={{
                background: viewMode === 'full' ? '#0085ff' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: viewMode === 'full' ? 600 : 400
              }}
              title="มุมมองเต็มจอ Dark Mode (สไตล์ Monday Docs)"
            >
              🖥️ เต็มจอ
            </button>
          </div>

          {/* Stats Badge */}
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '0.4rem 0.8rem', borderRadius: '6px', display: 'flex', gap: '0.75rem' }}>
            <span>คำทั้งหมด: <strong style={{ color: 'var(--text-main)' }}>{wordCount}</strong></span>
            <span>ตัวอักษร: <strong style={{ color: 'var(--text-main)' }}>{charCount}</strong></span>
          </div>

          {/* Templates Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              style={{
                background: '#282d4f',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <FiFile size={15} /> เทมเพลตเอกสาร
            </button>

            {showTemplates && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: '#282d4f',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                zIndex: 200,
                width: '260px',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
                  เลือกเทมเพลตเริ่มต้น
                </div>
                {TEMPLATES.map((tpl, i) => (
                  <div
                    key={i}
                    onClick={() => applyTemplate(tpl.content)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderBottom: i < TEMPLATES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {tpl.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Print / Export PDF */}
          <button
            onClick={handlePrint}
            style={{
              background: '#282d4f',
              border: '1px solid var(--border-color)',
              color: '#fff',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title="พิมพ์เอกสาร หรือส่งออกเป็นไฟล์ PDF"
          >
            <FiPrinter size={15} /> พิมพ์ / PDF
          </button>

          {/* Manual Save */}
          <button 
            className="btn-primary" 
            onClick={handleManualSave}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              background: saveStatus === 'Saved!' ? 'var(--success-color, #00c875)' : 'var(--accent-blue)',
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              transition: 'background 0.3s'
            }}
          >
            {saveStatus === 'Saving...' ? <FiRefreshCw className="spin" size={14} /> : saveStatus === 'Saved!' ? <FiCheck size={14} /> : <FiSave size={14} />} 
            {saveStatus === 'Saving...' ? 'กำลังบันทึก...' : saveStatus === 'Saved!' ? 'บันทึกแล้ว ✓' : 'บันทึก'}
          </button>

          {/* Close */}
          {onClose && (
            <button 
              onClick={onClose}
              style={{ 
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Editor Main Container */}
      <div style={{ 
        flex: 1, 
        background: viewMode === 'a4' ? '#121424' : '#20243f', 
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        alignItems: viewMode === 'a4' ? 'center' : 'stretch',
        padding: viewMode === 'a4' ? '1.5rem 0' : 0
      }}>
        <style>
          {`
            .ql-toolbar.ql-snow {
              border: none !important;
              border-bottom: 1px solid var(--border-color) !important;
              padding: 10px 16px !important;
              background: #1c2038;
              width: 100%;
            }
            .ql-container.ql-snow {
              border: none !important;
              flex: 1;
              font-family: inherit;
              font-size: 1rem;
              color: ${viewMode === 'a4' ? '#222' : 'var(--text-main)'};
              overflow-y: auto;
              width: 100%;
            }
            .ql-editor {
              padding: ${viewMode === 'a4' ? '3rem 4rem' : '2.5rem 3rem'} !important;
              min-height: 100%;
              line-height: 1.7;
              background-color: ${viewMode === 'a4' ? '#ffffff' : 'transparent'};
              width: ${viewMode === 'a4' ? '820px' : '100%'};
              margin: ${viewMode === 'a4' ? '0 auto' : 0};
              box-shadow: ${viewMode === 'a4' ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'};
              border-radius: ${viewMode === 'a4' ? '4px' : 0};
              color: ${viewMode === 'a4' ? '#222222' : 'var(--text-main)'};
            }
            .ql-snow .ql-stroke {
              stroke: var(--text-muted);
            }
            .ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill {
              fill: var(--text-muted);
            }
            .ql-snow .ql-picker {
              color: var(--text-muted);
            }
            .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow.ql-toolbar button.ql-active .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke {
              stroke: var(--accent-blue);
            }
            .ql-snow.ql-toolbar button:hover .ql-fill, .ql-snow.ql-toolbar button.ql-active .ql-fill {
              fill: var(--accent-blue);
            }
            .ql-snow .ql-picker-options {
              background-color: #20243f;
              border-color: var(--border-color);
            }
            .ql-editor.ql-blank::before {
              color: ${viewMode === 'a4' ? '#999999' : 'rgba(255,255,255,0.3)'} !important;
              font-style: normal;
            }
          `}
        </style>
        <ReactQuill 
          theme="snow" 
          value={content} 
          onChange={setContent} 
          modules={modules}
          placeholder="เริ่มพิมพ์เอกสารของคุณที่นี่... (รองรับการจัดรูปแบบตัวหนา ตัวเอียง จัดหัวข้อ ใส่ตาราง และเทมเพลต MS Word)"
          style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}
        />
      </div>
    </div>
  );
};

export default DocumentView;
