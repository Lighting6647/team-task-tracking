import React, { useState, useEffect } from 'react';
import { FiX, FiMessageCircle, FiAlignLeft, FiSend } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

const TaskDrawer = ({ isOpen, onClose, task, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('updates'); // 'updates' | 'description'
  const [newUpdate, setNewUpdate] = useState('');
  const [description, setDescription] = useState(task?.description || '');

  useEffect(() => {
    if (task) {
      setDescription(task.description || '');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handlePostUpdate = () => {
    if (!newUpdate.trim()) return;
    
    const updateObj = {
      id: uuidv4(),
      text: newUpdate,
      createdAt: new Date().toISOString(),
      user: 'You' // Mock user for now
    };

    const currentUpdates = task.updates || [];
    onUpdate('updates', [...currentUpdates, updateObj]);
    setNewUpdate('');
  };

  const handleSaveDescription = () => {
    onUpdate('description', description);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 999,
          backdropFilter: 'blur(2px)'
        }}
      />
      
      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '450px',
        maxWidth: '100vw',
        background: 'rgba(29, 30, 47, 0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.5rem', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
              {task.title}
            </h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setActiveTab('updates')}
                style={{
                  background: 'transparent', border: 'none', 
                  color: activeTab === 'updates' ? 'var(--accent-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'updates' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <FiMessageCircle /> Updates ({(task.updates || []).length})
              </button>
              <button 
                onClick={() => setActiveTab('description')}
                style={{
                  background: 'transparent', border: 'none', 
                  color: activeTab === 'description' ? 'var(--accent-purple)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'description' ? '2px solid var(--accent-purple)' : '2px solid transparent',
                  padding: '0.25rem 0.5rem', cursor: 'pointer', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <FiAlignLeft /> Description
              </button>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-muted)', 
              cursor: 'pointer', padding: '0.5rem' 
            }}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          
          {activeTab === 'updates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
              {/* Input Area */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <textarea 
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  placeholder="Write an update..."
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-main)',
                    resize: 'vertical', minHeight: '80px', outline: 'none', fontFamily: 'inherit'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn-primary" 
                    onClick={handlePostUpdate}
                    disabled={!newUpdate.trim()}
                    style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: !newUpdate.trim() ? 0.5 : 1 }}
                  >
                    <FiSend size={14} /> Update
                  </button>
                </div>
              </div>

              {/* Updates List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(task.updates || []).map((update, index) => (
                  <div key={update.id || index} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{update.user}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(update.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {update.text}
                    </div>
                  </div>
                ))}
                {(task.updates || []).length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                    No updates yet. Start the conversation!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'description' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
               <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSaveDescription}
                  placeholder="Add a detailed description for this task..."
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.1)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    resize: 'none', 
                    padding: '1rem',
                    outline: 'none', 
                    fontFamily: 'inherit',
                    lineHeight: '1.6'
                  }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  Auto-saves on blur
                </div>
             </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default TaskDrawer;
