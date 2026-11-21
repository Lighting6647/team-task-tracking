import React, { useState } from 'react';
import { FiX, FiCloud, FiRefreshCw, FiCheck, FiCopy, FiAlertCircle, FiDatabase, FiDownload } from 'react-icons/fi';
import { SUPABASE_SQL_SCHEMA } from '../utils/cloudSync';

const CloudSyncModal = ({
  isOpen,
  onClose,
  config,
  syncStatus, // 'local' | 'syncing' | 'synced' | 'error'
  syncError,
  lastSyncedAt,
  onSaveConfig,
  onPushNow,
  onPullNow,
}) => {
  const [draft, setDraft] = useState(config);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig(draft);
  };

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA).catch(() => {});
    }
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const statusMeta = {
    local: { label: 'Local Storage Only', color: '#94a3b8', bg: 'rgba(148,163,184,0.14)' },
    syncing: { label: 'กำลังซิงค์...', color: '#0073ea', bg: 'rgba(0,115,234,0.16)' },
    synced: { label: 'Cloud Synced ✓', color: '#00c875', bg: 'rgba(0,200,117,0.16)' },
    error: { label: 'Sync Error (ใช้ข้อมูลในเครื่องแทน)', color: '#e2445c', bg: 'rgba(226,68,92,0.16)' },
  }[syncStatus] || { label: 'Local Storage Only', color: '#94a3b8', bg: 'rgba(148,163,184,0.14)' };

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
        aria-label="Cloud Sync Settings"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
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
            <FiCloud size={19} color="#0073ea" />
            <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700 }}>Cloud Sync (Supabase / PostgreSQL API)</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Cloud Sync" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', padding: '0.75rem 1rem', borderRadius: '10px', backgroundColor: statusMeta.bg, border: `1px solid ${statusMeta.color}44` }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: statusMeta.color }}>{statusMeta.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {lastSyncedAt ? `ซิงค์ล่าสุด: ${new Date(lastSyncedAt).toLocaleString('th-TH')}` : 'ยังไม่ได้ซิงค์ขึ้น Cloud'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <button type="button" onClick={onPullNow} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                <FiDownload size={13} /> Pull ลงเครื่อง
              </button>
              <button type="button" onClick={onPushNow} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                <FiRefreshCw size={13} /> Push ขึ้น Cloud
              </button>
            </div>
          </div>

          {syncError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(226,68,92,0.12)', color: '#fda4af', fontSize: '0.82rem' }}>
              <FiAlertCircle size={16} />
              <span>{syncError}</span>
            </div>
          )}

          {/* Provider */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
              โหมดการจัดเก็บข้อมูล (Storage Provider)
            </label>
            <select
              value={draft.provider}
              onChange={(e) => setDraft({ ...draft, provider: e.target.value })}
              style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
            >
              <option value="local">Local Storage (เก็บเฉพาะเครื่องนี้)</option>
              <option value="supabase">Supabase (PostgreSQL REST API)</option>
              <option value="custom">Custom REST API (PostgreSQL / Backend ของคุณเอง)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
              Team / Workspace Sync Key
            </label>
            <input
              type="text"
              value={draft.workspaceKey}
              onChange={(e) => setDraft({ ...draft, workspaceKey: e.target.value })}
              placeholder="เช่น light-team-main"
              style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
            />
          </div>

          {draft.provider === 'supabase' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={draft.supabaseUrl}
                  onChange={(e) => setDraft({ ...draft, supabaseUrl: e.target.value })}
                  placeholder="https://xxxxxxxx.supabase.co"
                  style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                  Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  value={draft.supabaseAnonKey}
                  onChange={(e) => setDraft({ ...draft, supabaseAnonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>
                    <FiDatabase size={14} color="#00c875" /> SQL สร้างตารางบน Supabase (ครั้งเดียว)
                  </span>
                  <button type="button" onClick={handleCopySql} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.55rem', fontSize: '0.74rem', borderRadius: '6px' }}>
                    {copiedSql ? <><FiCheck size={12} color="#00c875" /> คัดลอกแล้ว</> : <><FiCopy size={12} /> Copy SQL</>}
                  </button>
                </div>
                <pre style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </>
          )}

          {draft.provider === 'custom' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                Custom REST API Endpoint (รองรับ GET / PUT JSON)
              </label>
              <input
                type="url"
                value={draft.customApiUrl}
                onChange={(e) => setDraft({ ...draft, customApiUrl: e.target.value })}
                placeholder="https://your-api.vercel.app/api/tracking-sync"
                style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={draft.autoSync}
              onChange={(e) => setDraft({ ...draft, autoSync: e.target.checked })}
            />
            ซิงค์อัตโนมัติทันทีเมื่อมีการแก้ไขข้อมูล (Auto-Sync Debounce 1.2 วินาที)
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.45rem 0.95rem', borderRadius: '8px' }}>
              ปิด
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.45rem 1.05rem', borderRadius: '8px' }}>
              บันทึกการตั้งค่า Cloud Sync
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloudSyncModal;
