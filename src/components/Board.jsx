import React from 'react';
import TaskCard from './TaskCard';

const COLUMNS = [
  { id: 'todo', title: 'To Do', className: 'status-todo' },
  { id: 'inprogress', title: 'In Progress', className: 'status-inprogress' },
  { id: 'review', title: 'Review', className: 'status-review' },
  { id: 'done', title: 'Done', className: 'status-done' },
];

const Board = ({ tasks, onEditTask, onDeleteTask, onDropTask }) => {
  
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div className="board">
      {COLUMNS.map(column => {
        const columnTasks = tasks.filter(t => t.status === column.id);
        
        return (
          <div 
            key={column.id} 
            className="column glass"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`column-header ${column.className}`}>
              <div className="column-title">
                <span className="status-dot"></span>
                {column.title}
              </div>
              <span className="task-count">{columnTasks.length}</span>
            </div>
            
            <div className="column-content">
              {columnTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={onEditTask} 
                  onDelete={onDeleteTask}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Board;
