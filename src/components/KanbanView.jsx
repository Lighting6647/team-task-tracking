import React from 'react';
import { FiClock, FiUser, FiMessageCircle } from 'react-icons/fi';

const KanbanView = ({ board, updateItem, onOpenItem }) => {
  if (!board || board.type !== 'grid') return null;

  const statusCol = board.columns.find(c => c.type === 'status');
  if (!statusCol) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h2 style={{ color: 'var(--text-main)' }}>Kanban Board requires a Status column</h2>
        <p>Please add a status column to use this view.</p>
      </div>
    );
  }

  const statusOptions = statusCol.options || [];
  const allItems = board.groups.flatMap(g => 
    g.items.map(item => ({ ...item, groupId: g.id, groupColor: g.color }))
  );

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      itemId: item.id,
      groupId: item.groupId
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatusId) => {
    e.preventDefault();
    const dataString = e.dataTransfer.getData('application/json');
    if (!dataString) return;
    try {
      const { itemId, groupId } = JSON.parse(dataString);
      updateItem(groupId, itemId, statusCol.id, newStatusId);
    } catch(err) {
      console.error('Drop error', err);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1.5rem', 
      padding: '2rem', 
      height: '100%', 
      overflowX: 'auto',
      overflowY: 'hidden',
      alignItems: 'flex-start'
    }}>
      {statusOptions.map(option => {
        const columnItems = allItems.filter(item => {
          const itemStatus = item[statusCol.id];
          if (!itemStatus && option.id === 'empty') return true;
          return itemStatus === option.id;
        });

        return (
          <div 
            key={option.id} 
            style={{
              minWidth: '300px',
              maxWidth: '300px',
              background: 'rgba(29, 30, 47, 0.4)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, option.id)}
          >
            <div style={{ 
              padding: '1rem', 
              borderBottom: `2px solid ${option.color}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.02)',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: option.color }}></span>
                {option.label || 'Empty'}
              </h3>
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                {columnItems.length}
              </span>
            </div>

            <div style={{ 
              padding: '1rem', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              flex: 1
            }}>
              {columnItems.map(item => (
                <div 
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  style={{
                    background: 'rgba(38, 40, 64, 0.65)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderLeft: `4px solid ${item.groupColor}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: 'grab',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s, boxShadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onClick={(e) => {
                    // Prevent drawer open if they are dragging
                    if (e.defaultPrevented) return;
                    onOpenItem && onOpenItem(item.groupId, item.id);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                      {item.title}
                    </div>
                    {(item.updates?.length > 0) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-blue)', opacity: 0.8 }}>
                        <FiMessageCircle size={12} /> {item.updates.length}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {board.columns.find(c => c.type === 'person') && item[board.columns.find(c => c.type === 'person').id] && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiUser /> {item[board.columns.find(c => c.type === 'person').id]}
                      </div>
                    )}
                    {board.columns.find(c => c.type === 'date') && item[board.columns.find(c => c.type === 'date').id] && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock /> {item[board.columns.find(c => c.type === 'date').id]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {columnItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>
                  ลากงานมาวางที่นี่
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanView;
