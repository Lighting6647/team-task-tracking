import React, { useState } from 'react';
import { FiX, FiShield, FiUser, FiLogIn, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { ROLES, signInWithSupabase } from '../utils/authPermissions';

const AuthPermissionsModal = ({
  isOpen,
  onClose,
  currentUser,
  workspace,
  cloudConfig,
  onUpdateUser,
  onUpdateMemberRole,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [role, setRole] = useState(currentUser?.role || 'Owner');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('local'); // 'local' | 'supabase'
  const [statusMsg, setStatusMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const canManage = currentUser?.role === 'Owner';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    if (authMode === 'supabase') {
      setSubmitting(true);
      try {
        const user = await signInWithSupabase({
          supabaseUrl: cloudConfig?.supabaseUrl,
          supabaseAnonKey: cloudConfig?.supabaseAnonKey,
          email: email.trim(),
          password,
        });
        onUpdateUser(user);
        setStatusMsg({ type: 'ok', text: `เข้าสู่ระบบ Supabase สำเร็จ (${user.email})` });
      } catch (err) {
        setStatusMsg({ type: 'err', text: err.message });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!name.trim()) return;
    onUpdateUser({
      ...currentUser,
      name: name.trim(),
      email: email.trim() || currentUser?.email || '',
      role,
      provider: 'local',
    });
    setStatusMsg({ type: 'ok', text: `อัปเดตบัญชีเป็น "${name.trim()}" (${role}) เรียบร้อยแล้ว` });
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
        aria-label="User Login and Permissions"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
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
            <FiShield size={18} color="#0073ea" />
            <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700 }}>User Login & Workspace Permissions</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Auth Modal" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>

        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setAuthMode('local')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: authMode === 'local' ? '#0073ea' : 'var(--bg-main)',
                color: authMode === 'local' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FiUser size={12} style={{ marginRight: '4px' }} /> Team Profile & Role
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('supabase')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: authMode === 'supabase' ? '#0073ea' : 'var(--bg-main)',
                color: authMode === 'supabase' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FiLogIn size={12} style={{ marginRight: '4px' }} /> Supabase Auth Login
            </button>
          </div>

          {statusMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: statusMsg.type === 'ok' ? 'rgba(0,200,117,0.14)' : 'rgba(226,68,92,0.14)',
                color: statusMsg.type === 'ok' ? '#00c875' : '#fda4af',
                fontSize: '0.82rem',
              }}
            >
              {statusMsg.type === 'ok' ? <FiCheckCircle size={15} /> : <FiAlertCircle size={15} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {authMode === 'local' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  ชื่อผู้ใช้งาน (Display Name)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                อีเมล (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={authMode === 'supabase'}
                style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
            </div>

            {authMode === 'supabase' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  รหัสผ่าน Supabase (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
                  สิทธิ์การใช้งานปัจจุบัน (Active Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
                >
                  <option value="Owner">Owner — สิทธิ์เต็ม (แก้ไข ลบ และจัดการสิทธิ์สมาชิก)</option>
                  <option value="Member">Member — สร้าง/แก้ไขบอร์ดและงานได้ (จัดการสิทธิ์ไม่ได้)</option>
                  <option value="Viewer">Viewer — ดูอย่างเดียว (Read-only)</option>
                </select>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.45rem 1rem', borderRadius: '8px' }}>
              {submitting ? 'กำลังตรวจสอบ...' : authMode === 'supabase' ? 'เข้าสู่ระบบด้วย Supabase' : 'บันทึกบัญชี & สิทธิ์'}
            </button>
          </form>

          {/* Workspace Member Role Matrix */}
          {workspace && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                สิทธิ์สมาชิกใน {workspace.name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(workspace.members || []).map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{m.email}</div>
                    </div>
                    <select
                      value={m.role || 'Member'}
                      disabled={!canManage}
                      onChange={(e) => onUpdateMemberRole && onUpdateMemberRole(workspace.id, m.id, e.target.value)}
                      style={{
                        padding: '0.3rem 0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.78rem',
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPermissionsModal;
