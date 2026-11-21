import React, { useState } from 'react';
import {
  FiGrid,
  FiLayout,
  FiFileText,
  FiFolder,
  FiPlus,
  FiUsers,
  FiClock,
  FiLayers,
  FiCopy,
  FiGlobe,
  FiLock,
  FiEdit2,
  FiCheck,
} from 'react-icons/fi';

const WorkspaceOverview = ({
  workspace,
  boards = [],
  recentBoardIds = [],
  onSelectBoard,
  onAddBoard,
  onOpenTemplates,
  onUpdateWorkspace,
  onAddMember,
}) => {
  const [activeTab, setActiveTab] = useState('recents');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(workspace?.description || '');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  if (!workspace) return null;

  const wsBoards = boards.filter((b) => !b.isArchived && !b.isDeleted);
  const nonFolderBoards = wsBoards.filter((b) => b.type !== 'folder');
  const recentBoards = recentBoardIds
    .map((id) => nonFolderBoards.find((b) => b.id === id))
    .filter(Boolean);
  const displayRecents = recentBoards.length > 0 ? recentBoards : nonFolderBoards.slice(0, 6);

  const renderTypeIcon = (type, color) => {
    if (type === 'dashboard') return <FiLayout size={18} color={color || '#0073ea'} />;
    if (type === 'doc') return <FiFileText size={18} color={color || '#c455de'} />;
    if (type === 'folder') return <FiFolder size={18} color={color || '#fdab3d'} />;
    return <FiGrid size={18} color={color || '#00c875'} />;
  };

  const countItems = (board) => {
    if (board.type !== 'grid' || !board.groups) return 0;
    return board.groups.reduce((sum, g) => sum + (g.items?.length || 0), 0);
  };

  const handleSaveDesc = () => {
    if (onUpdateWorkspace) {
      onUpdateWorkspace(workspace.id, { description: descDraft.trim() });
    }
    setEditingDesc(false);
  };

  const handleInviteMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    if (onAddMember) {
      onAddMember(workspace.id, {
        name: newMemberName.trim(),
        email: newMemberEmail.trim() || `${newMemberName.trim().toLowerCase().replace(/\s+/g, '.')}@team.local`,
        role: 'Member',
      });
    }
    setNewMemberName('');
    setNewMemberEmail('');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Hero Banner */}
      <div
        style={{
          height: '110px',
          background: `linear-gradient(135deg, ${workspace.color || '#0073ea'}26, ${workspace.color || '#0073ea'}08)`,
          borderBottom: '1px solid var(--border-color)',
          position: 'relative',
        }}
      />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 2rem 3rem' }}>
        {/* Workspace Avatar + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '-36px', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '14px',
                backgroundColor: workspace.color || '#0073ea',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                border: '3px solid var(--bg-main)',
              }}
            >
              {(workspace.name || 'M').charAt(0).toUpperCase()}
            </div>
            <div style={{ paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{workspace.name}</h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '999px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {workspace.type === 'closed' ? <FiLock size={11} /> : <FiGlobe size={11} />}
                  {workspace.type === 'closed' ? 'Closed workspace' : 'Open workspace'}
                </span>
              </div>

              {editingDesc ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <input
                    type="text"
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    placeholder="เพิ่มคำอธิบายพื้นที่ทำงาน..."
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid var(--accent-blue)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      minWidth: '280px',
                      fontSize: '0.85rem',
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveDesc()}
                    autoFocus
                  />
                  <button type="button" onClick={handleSaveDesc} className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                    <FiCheck size={14} /> บันทึก
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDescDraft(workspace.description || '');
                    setEditingDesc(true);
                  }}
                  style={{
                    marginTop: '0.25rem',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span>{workspace.description || 'Add workspace description'}</span>
                  <FiEdit2 size={12} />
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => onOpenTemplates && onOpenTemplates()} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', borderRadius: '8px' }}>
              <FiCopy size={15} /> Start with a template
            </button>
            <button type="button" onClick={() => onAddBoard && onAddBoard('grid', null)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.95rem', borderRadius: '8px' }}>
              <FiPlus size={15} /> Add new board
            </button>
          </div>
        </div>

        {/* Workspace Tabs */}
        <div style={{ display: 'flex', gap: '1.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          {[
            { id: 'recents', label: 'Recents', icon: <FiClock size={14} /> },
            { id: 'content', label: `Content (${nonFolderBoards.length})`, icon: <FiLayers size={14} /> },
            { id: 'collaborators', label: `Collaborators (${workspace.members?.length || 1})`, icon: <FiUsers size={14} /> },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.7rem 0.2rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: active ? '2px solid #0073ea' : '2px solid transparent',
                  color: active ? '#0073ea' : 'var(--text-muted)',
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab: Recents */}
        {activeTab === 'recents' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
              {/* Add New Board CTA */}
              <button
                type="button"
                onClick={() => onAddBoard && onAddBoard('grid', null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: '132px',
                  borderRadius: '10px',
                  border: '1.5px dashed var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '1rem',
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(0, 115, 234, 0.14)', color: '#0073ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiPlus size={20} />
                </div>
                <strong style={{ fontSize: '0.92rem' }}>Add new board</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>สร้างบอร์ดงานใหม่จากหน้าว่าง</span>
              </button>

              {/* Start with a Template CTA */}
              <button
                type="button"
                onClick={() => onOpenTemplates && onOpenTemplates()}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  minHeight: '132px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'linear-gradient(135deg, rgba(0,115,234,0.12), rgba(0,200,117,0.10))',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '1rem',
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(0, 200, 117, 0.18)', color: '#00c875', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiCopy size={18} />
                </div>
                <strong style={{ fontSize: '0.92rem' }}>Start with a template</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>เลือกจากเทมเพลตพร้อมใช้งาน 5 หมวด</span>
              </button>

              {/* Recent Board Cards */}
              {displayRecents.map((board) => (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => onSelectBoard && onSelectBoard(board.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    minHeight: '132px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    padding: '1rem',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    {renderTypeIcon(board.type, board.color)}
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {board.type}
                    </span>
                  </div>
                  <div style={{ width: '100%' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {board.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {board.type === 'grid'
                        ? `${countItems(board)} items • ${board.groups?.length || 0} groups`
                        : board.type === 'dashboard'
                          ? `${board.widgets?.length || 0} widgets`
                          : 'Workdoc'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Content */}
        {activeTab === 'content' && (
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
            {nonFolderBoards.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Nothing to show here, yet — กด &quot;Add new board&quot; หรือ &quot;Start with a template&quot; เพื่อเริ่มต้น
              </div>
            ) : (
              nonFolderBoards.map((board, idx) => (
                <div
                  key={board.id}
                  onClick={() => onSelectBoard && onSelectBoard(board.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.1rem',
                    borderBottom: idx < nonFolderBoards.length - 1 ? '1px solid var(--border-color)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {renderTypeIcon(board.type, board.color)}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{board.title}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {board.type === 'grid' ? `Board • ${countItems(board)} items` : board.type === 'dashboard' ? 'Dashboard' : 'Document'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#0073ea', fontWeight: 600 }}>เปิดดู →</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Collaborators */}
        {activeTab === 'collaborators' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <form
              onSubmit={handleInviteMember}
              style={{
                display: 'flex',
                gap: '0.6rem',
                flexWrap: 'wrap',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="ชื่อสมาชิกทีม..."
                style={{ flex: 1, minWidth: '180px', padding: '0.45rem 0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="อีเมล (ไม่บังคับ)"
                style={{ flex: 1, minWidth: '200px', padding: '0.45rem 0.7rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.45rem 1rem', borderRadius: '6px' }}>
                + Invite member
              </button>
            </form>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
              {(workspace.members || []).map((member, idx) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.1rem',
                    borderBottom: idx < workspace.members.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: '#0073ea',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.76rem', padding: '0.2rem 0.55rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceOverview;
