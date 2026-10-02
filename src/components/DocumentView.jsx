import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiFileText, FiCheck, FiRefreshCw, FiX, FiPrinter, FiFile, FiCopy, FiInfo, FiLayout, FiMaximize, FiEdit3, FiGrid, FiPlusCircle, FiList, FiCheckSquare } from 'react-icons/fi';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const TEMPLATES = [
  {
    name: '📄 ข้อเสนอโครงการ (Project Proposal)',
    content: `<h1>📄 เอกสารข้อเสนอโครงการ (Project Proposal)</h1>
<p><strong>ชื่อโครงการ:</strong> พัฒนาระบบติดตามงานและบริหารองค์กร (Pass App) | <strong>วันที่:</strong> ${new Date().toLocaleDateString('th-TH')}</p>
<hr/>
<h2>1. วัตถุประสงค์ (Objectives)</h2>
<p>เพื่อยกระดับการทำงานร่วมกันของทีม เพิ่มความโปร่งใส ลดระยะเวลาในการติดตามงาน และเชื่อมต่อระบบการจัดการเอกสาร MS Office สมบูรณ์แบบ</p>

<h2>2. ขอบเขตงาน (Scope of Work)</h2>
<ul>
  <li>รองรับการจัดการบอร์ดงานหลายรูปแบบ (Main Table, Kanban, Timeline, Form, Presentation)</li>
  <li>ระบบจัดการเอกสาร MS Word (Rich Text, A4 Layout, Auto-save, PDF Export)</li>
  <li>ระบบตารางจัดการข้อมูล MS Excel พร้อมฟังก์ชันดาวน์โหลด CSV/Excel</li>
</ul>

<h2>3. งบประมาณและไทม์ไลน์</h2>
<blockquote style="background: rgba(87, 155, 252, 0.1); padding: 12px 16px; border-left: 4px solid #579bfc; color: #333;">
  <p><strong>ระยะเวลาดำเนินการ:</strong> 4 สัปดาห์ | <strong>งบประมาณประเมิน:</strong> 250,000 บาท</p>
</blockquote>`
  },
  {
    name: '📝 รายงานการประชุม (Meeting Minutes)',
    content: `<h1>📝 บันทึกรายงานการประชุม (Meeting Minutes)</h1>
<p><strong>เรื่อง:</strong> การติดตามความคืบหน้าโครงการประจำสัปดาห์ | <strong>ประธานการประชุม:</strong> ทีมบริหารโปรเจกต์</p>
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
    name: '📋 สัญญาและข้อตกลง (Service Contract)',
    content: `<h1>📋 หนังสือสัญญาจ้างบริการ (Service Contract)</h1>
<p><strong>สัญญาเลขที่:</strong> CT-2026/001 | <strong>วันที่ทำสัญญา:</strong> ${new Date().toLocaleDateString('th-TH')}</p>
<hr/>
<h2>ข้อ 1. ตกลงว่าจ้าง</h2>
<p>ผู้ว่าจ้างตกลงว่าจ้าง และผู้รับจ้างตกลงรับจ้างพัฒนาระบบซอฟต์แวร์ตามเงื่อนไขและข้อกำหนดในสัญญานี้</p>

<h2>ข้อ 2. การชำระเงิน</h2>
<p>แบ่งจ่ายเป็น 2 งวด ตามความคืบหน้าของงานที่ส่งมอบ</p>`
  }
];

const DocumentView = ({ board, updateDocument, onClose }) => {
  const [content, setContent] = useState(board.content || '');
  const [saveStatus, setSaveStatus] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'file' | 'home' | 'insert' | 'layout' | 'review'
  const [viewMode, setViewMode] = useState('a4'); // 'a4' | 'full'
  const timeoutRef = useRef(null);
  const isFirstRender = useRef(true);
  const quillRef = useRef(null);

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
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #222; line-height: 1.7; }
            h1 { font-size: 24pt; color: #111; border-bottom: 2px solid #0085ff; padding-bottom: 8px; }
            h2 { font-size: 16pt; color: #0085ff; margin-top: 20px; }
            blockquote { background: #f0f4f8; padding: 12px 16px; border-left: 4px solid #0085ff; margin: 15px 0; }
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

  const insertSnippet = (htmlSnippet) => {
    setContent(prev => prev + htmlSnippet);
  };

  // Compute Stats
  const plainText = content.replace(/<[^>]+>/g, '').trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

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
    <div className="document-view-container" style={{ padding: '1.25rem 2rem', display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--text-main)' }}>
      
      {/* MS Office Top Application Banner */}
      <div style={{ background: '#1c2038', borderRadius: '10px 10px 0 0', border: '1px solid var(--border-color)', borderBottom: 'none', padding: '0.6rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Office App Name & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#2b579a', color: '#fff', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
            W
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{board.title || 'Untitled Document'}</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(87, 155, 252, 0.2)', color: '#579bfc', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>MS Word</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Microsoft Office 365 Integration Mode • {saveStatus === 'Saving...' ? 'กำลังบันทึก...' : saveStatus === 'Saved!' ? 'บันทึกอัตโนมัติแล้ว ✓' : 'พร้อมใช้งาน'}
            </span>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handlePrint}
            style={{ background: '#282d4f', border: '1px solid var(--border-color)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FiPrinter size={14} /> พิมพ์ / PDF
          </button>
          
          <button 
            className="btn-primary" 
            onClick={handleManualSave}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.8rem', background: saveStatus === 'Saved!' ? '#00c875' : '#0085ff' }}
          >
            {saveStatus === 'Saving...' ? <FiRefreshCw className="spin" size={13} /> : saveStatus === 'Saved!' ? <FiCheck size={13} /> : <FiSave size={13} />} 
            {saveStatus === 'Saved!' ? 'บันทึกแล้ว' : 'บันทึก'}
          </button>
          
          {onClose && (
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Office Ribbon Tabs Header */}
      <div style={{ background: '#20243f', border: '1px solid var(--border-color)', borderTop: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1rem', display: 'flex', gap: '0.25rem' }}>
        <button 
          onClick={() => setActiveTab('file')}
          style={{ padding: '0.5rem 1rem', background: activeTab === 'file' ? '#2b579a' : 'transparent', color: activeTab === 'file' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, borderRadius: '4px 4px 0 0' }}
        >
          ไฟล์ (File)
        </button>
        <button 
          onClick={() => setActiveTab('home')}
          style={{ padding: '0.5rem 1rem', background: activeTab === 'home' ? '#282d4f' : 'transparent', color: activeTab === 'home' ? '#fff' : 'var(--text-muted)', border: 'none', borderBottom: activeTab === 'home' ? '2px solid #579bfc' : 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
        >
          หน้าแรก (Home)
        </button>
        <button 
          onClick={() => setActiveTab('insert')}
          style={{ padding: '0.5rem 1rem', background: activeTab === 'insert' ? '#282d4f' : 'transparent', color: activeTab === 'insert' ? '#fff' : 'var(--text-muted)', border: 'none', borderBottom: activeTab === 'insert' ? '2px solid #579bfc' : 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
        >
          แทรก (Insert)
        </button>
        <button 
          onClick={() => setActiveTab('layout')}
          style={{ padding: '0.5rem 1rem', background: activeTab === 'layout' ? '#282d4f' : 'transparent', color: activeTab === 'layout' ? '#fff' : 'var(--text-muted)', border: 'none', borderBottom: activeTab === 'layout' ? '2px solid #579bfc' : 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
        >
          เค้าโครง (Layout)
        </button>
        <button 
          onClick={() => setActiveTab('review')}
          style={{ padding: '0.5rem 1rem', background: activeTab === 'review' ? '#282d4f' : 'transparent', color: activeTab === 'review' ? '#fff' : 'var(--text-muted)', border: 'none', borderBottom: activeTab === 'review' ? '2px solid #579bfc' : 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
        >
          ตรวจทาน (Review & Stats)
        </button>
      </div>

      {/* Ribbon Tab Content Bar */}
      <div style={{ background: '#1c2038', border: '1px solid var(--border-color)', borderTop: 'none', padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '1rem', minHeight: '44px', flexWrap: 'wrap' }}>
        
        {/* FILE TAB */}
        {activeTab === 'file' && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: '100%' }}>
            <span style={{ fontWeight: 600, color: '#fff' }}>เทมเพลตเอกสาร:</span>
            {TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                onClick={() => applyTemplate(tpl.content)}
                style={{ background: '#282d4f', border: '1px solid var(--border-color)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        )}

        {/* HOME TAB (Instruction message) */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>💡 ใช้แถบเครื่องมือ Rich Text (ตัวหนา, หัวข้อ, สี, ตาราง, บูลเล็ต) ด้านล่างได้ทันที</span>
          </div>
        )}

        {/* INSERT TAB */}
        {activeTab === 'insert' && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => insertSnippet('<table border="1" style="width:100%; border-collapse:collapse; margin:10px 0;"><tr><th>หัวข้อ 1</th><th>หัวข้อ 2</th></tr><tr><td>ข้อมูล 1</td><td>ข้อมูล 2</td></tr></table>')}
              style={{ background: '#282d4f', border: '1px solid var(--border-color)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FiGrid size={13} /> แทรกตาราง (Table)
            </button>
            <button
              onClick={() => insertSnippet('<blockquote style="background:rgba(87,155,252,0.1); padding:10px; border-left:4px solid #579bfc; margin:10px 0;"><p>ข้อความเน้นย้ำ (Callout Note)</p></blockquote>')}
              style={{ background: '#282d4f', border: '1px solid var(--border-color)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FiPlusCircle size={13} /> แทรกกล่องเน้นความ (Callout Box)
            </button>
            <button
              onClick={() => insertSnippet('<hr style="border:none; border-top:1px solid #579bfc; margin:15px 0;"/>')}
              style={{ background: '#282d4f', border: '1px solid var(--border-color)', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              ➖ แทรกเส้นแบ่ง (Horizontal Line)
            </button>
          </div>
        )}

        {/* LAYOUT TAB */}
        {activeTab === 'layout' && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#fff' }}>รูปแบบหน้ากระดาษ:</span>
            <button
              onClick={() => setViewMode('a4')}
              style={{ background: viewMode === 'a4' ? '#0085ff' : '#282d4f', border: '1px solid var(--border-color)', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: viewMode === 'a4' ? 600 : 400 }}
            >
              📄 หน้ากระดาษ A4 Word (มีขอบขาว)
            </button>
            <button
              onClick={() => setViewMode('full')}
              style={{ background: viewMode === 'full' ? '#0085ff' : '#282d4f', border: '1px solid var(--border-color)', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: viewMode === 'full' ? 600 : 400 }}
            >
              🖥️ มุมมองเต็มจอ Dark Mode
            </button>
          </div>
        )}

        {/* REVIEW TAB */}
        {activeTab === 'review' && (
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', color: '#fff' }}>
            <span>จำนวนคำทั้งหมด: <strong style={{ color: '#579bfc' }}>{wordCount} คำ</strong></span>
            <span>จำนวนตัวอักษร: <strong style={{ color: '#579bfc' }}>{charCount} ตัว</strong></span>
            <span>เวลาอ่านโดยประมาณ: <strong style={{ color: '#00c875' }}>{readingTime} นาที</strong></span>
          </div>
        )}
      </div>

      {/* Editor Main Container */}
      <div style={{ 
        flex: 1, 
        background: viewMode === 'a4' ? '#121424' : '#20243f', 
        borderRadius: '0 0 10px 10px',
        border: '1px solid var(--border-color)',
        borderTop: 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
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
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 1rem;
              color: ${viewMode === 'a4' ? '#222' : 'var(--text-main)'};
              overflow-y: auto;
              width: 100%;
              background: ${viewMode === 'a4' ? '#121426' : 'transparent'};
              display: flex;
              justify-content: center;
              padding: ${viewMode === 'a4' ? '2rem 0' : '0'};
            }
            .ql-editor {
              padding: ${viewMode === 'a4' ? '3rem 4rem' : '2.5rem 3rem'} !important;
              min-height: ${viewMode === 'a4' ? '1000px' : '100%'};
              height: auto !important;
              line-height: 1.7;
              background-color: ${viewMode === 'a4' ? '#ffffff' : 'transparent'};
              width: ${viewMode === 'a4' ? '820px' : '100%'};
              max-width: 100%;
              box-shadow: ${viewMode === 'a4' ? '0 12px 40px rgba(0,0,0,0.6)' : 'none'};
              border-radius: ${viewMode === 'a4' ? '4px' : '0'};
              color: ${viewMode === 'a4' ? '#222222' : 'var(--text-main)'};
              position: relative !important;
            }
            .ql-editor.ql-blank::before {
              color: ${viewMode === 'a4' ? '#888888' : 'rgba(255,255,255,0.3)'} !important;
              font-style: normal;
              left: ${viewMode === 'a4' ? '4rem' : '3rem'} !important;
              right: ${viewMode === 'a4' ? '4rem' : '3rem'} !important;
              top: ${viewMode === 'a4' ? '3rem' : '2.5rem'} !important;
              position: absolute !important;
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
          `}
        </style>
        <ReactQuill 
          ref={quillRef}
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
