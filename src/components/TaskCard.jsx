import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const TaskCard = ({ task, onEdit, onDelete, onDragStart }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div 
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
    >
      <div className="task-actions">
        <button className="btn-icon btn-sm" onClick={() => onEdit(task)}>
          <FiEdit2 size={14} />
        </button>
        <button className="btn-icon btn-sm btn-delete" onClick={() => onDelete(task.id)}>
          <FiTrash2 size={14} />
        </button>
      </div>
      
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
      </div>
      
      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}
      
      <div className="task-footer">
        <div className="task-assignee">
          <div className="avatar" title={task.assignee || 'Unassigned'}>
            {getInitials(task.assignee)}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {task.assignee || 'Unassigned'}
          </span>
        </div>
        
        <div className="task-meta">
          <span className={`priority-badge priority-${task.priority}`} title={`Priority: ${task.priority}`}></span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
