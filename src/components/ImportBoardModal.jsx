import React, { useState, useMemo } from 'react';
import { FiX, FiUpload, FiFileText, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { parseDelimitedText, inferColumnsFromTable, buildBoardFromDelimited } from '../utils/boardImporter';

const SAMPLE_CSV = `Task Name,Owner,Status,Budget,Due Date
ออกแบบหน้า Landing Page,Design Team,Done,25000,2026-11-25
เชื่อมต่อระบบชำระเงิน,Dev Team,Working on it,45000,2026-12-01
ทดสอบระบบก่อนเปิดตัว,QA Team,Stuck,15000,2026-12-05`;

const ImportBoardModal = ({ isOpen, onClose, workspaceId = 'ws-main', onImportBoard }) => {
  const [boardTitle, setBoardTitle] = useState('Imported Sheet');
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState('');

  const preview = useMemo(() => {
    if (!rawText.trim()) return null;
    const parsed = parseDelimitedText(rawText);
    if (parsed.headers.length === 0) return null;
    const cols = inferColumnsFromTable(parsed.headers, parsed.rows);
    return { ...parsed, cols };
  }, [rawText]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setBoardTitle(file.name.replace(/\.(csv|tsv|txt)$/i, ''));
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawText(String(ev.target?.result || ''));
    };
    reader.onerror = () => setError('ไม่สามารถอ่านไฟล์นี้ได้');
    reader.readAsText(file, 'utf-8');
  };

  const handleCreate = () => {
    setError('');
    try {
      const board = buildBoardFromDelimited({ boardTitle, rawText, workspaceId });
      onImportBoard(board);
      setRawText('');
      onClose();
    } catch (err) {
      setError(err.message || 'นำเข้าข้อมูลไม่สำเร็จ');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 2100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        role="dialog"
        aria-label="Import Excel or CSV to Board"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          overflow: 'hidden',
          color: 'var(--text-primary)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <FiUpload size={18} color="#00c875" />
            <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700 }}>Import Excel / CSV เป็น Board อัตโนมัติ</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Import Modal" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(226,68,92,0.14)', color: '#fda4af', fontSize: '0.82rem' }}>
              <FiAlertCircle size={15} /> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                ชื่อบอร์ดใหม่ (Board Name)
              </label>
              <input
                type="text"
                value={boardTitle}
                onChange={(e) => setBoardTitle(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
            </div>

            <label
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.84rem' }}
            >
              <FiUpload size={14} /> เลือกไฟล์ .CSV / .TSV
              <input type="file" accept=".csv,.tsv,.txt" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                หรือวางตารางที่คัดลอกจาก Excel / Google Sheets โดยตรง
              </label>
              <button
                type="button"
                onClick={() => {
                  setBoardTitle('แผนงานเปิดตัวสินค้า (Imported)');
                  setRawText(SAMPLE_CSV);
                }}
                style={{ background: 'none', border: 'none', color: '#0073ea', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                ใส่ข้อมูลตัวอย่าง (Sample)
              </button>
            </div>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="วางข้อมูล CSV หรือ Tab-separated จาก Excel ที่นี่ (แถวแรกเป็นชื่อคอลัมน์)..."
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
              }}
            />
          </div>

          {preview && (
            <div style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#00c875' }}>
                  <FiCheckCircle size={14} /> ตรวจพบ {preview.rows.length} รายการ และ {preview.cols.length} คอลัมน์อัตโนมัติ
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <FiFileText size={12} style={{ marginRight: '3px' }} />
                  {preview.cols.map((c) => `${c.title} (${c.type})`).join(' · ')}
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      {preview.headers.map((h, i) => (
                        <th key={i} style={{ textAlign: 'left', padding: '4px 8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.slice(0, 4).map((r, ri) => (
                      <tr key={ri}>
                        {r.map((cell, ci) => (
                          <td key={ci} style={{ padding: '4px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
                            {cell || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.45rem 0.9rem', borderRadius: '8px' }}>
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!preview || preview.rows.length === 0}
              className="btn-primary"
              style={{ padding: '0.45rem 1.05rem', borderRadius: '8px' }}
            >
              สร้าง Board ทันที ({preview?.rows.length || 0} รายการ)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportBoardModal;
