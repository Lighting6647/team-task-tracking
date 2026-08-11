import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiPlus, FiTrash2, FiExternalLink, FiStar } from 'react-icons/fi';
import StatusDropdown from './StatusDropdown';

const TableView = ({ 
  boardId, columns = [], groups, updateItem, addItem, deleteItem, addGroup, deleteGroup, renameGroup, 
  addColumn, renameColumn, deleteColumn, updateColumnOptions, updateColumnWidth, reorderColumns,
  hiddenColumns = [], isGroupedByStatus = false
}) => {
  const [newItems, setNewItems] = useState({});
  const [openColumnMenuGroupId, setOpenColumnMenuGroupId] = useState(null);
  const [resizingCol, setResizingCol] = useState(null);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingCol) return;
      const diff = e.clientX - resizingCol.startX;
      const newWidth = Math.max(80, resizingCol.startWidth + diff);
      updateColumnWidth(boardId, resizingCol.id, newWidth);
    };

    const handleMouseUp = () => {
      setResizingCol(null);
    };

    if (resizingCol) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, boardId, updateColumnWidth]);

  const handleResizeStart = (e, col) => {
    e.stopPropagation();
    setResizingCol({
      id: col.id,
      startX: e.clientX,
      startWidth: col.width || 150
    });
  };

  const handleDragStart = (e, colId) => {
    e.dataTransfer.setData('text/plain', colId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    const sourceColId = e.dataTransfer.getData('text/plain');
    if (sourceColId && sourceColId !== targetColId) {
      reorderColumns(boardId, sourceColId, targetColId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableContainerRef.current && !tableContainerRef.current.contains(event.target)) {
        setOpenColumnMenuGroupId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSubmit = (e, groupId) => {
    if (e.key === 'Enter') {
      const val = newItems[groupId];
      if (val && val.trim()) {
        addItem(groupId, val.trim());
        setNewItems({ ...newItems, [groupId]: '' });
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleAddNewColumn = (type, title) => {
    addColumn(boardId, type, title);
    setOpenColumnMenuGroupId(null);
  };

  const renderCell = (group, item, col) => {
    switch(col.type) {
      case 'status':
        return (
          <StatusDropdown 
            statusId={item[col.id]} 
            statusOptions={col.options || []}
            setStatusOptions={(newOptions) => updateColumnOptions(boardId, col.id, newOptions)}
            onStatusChange={(newStatusId) => updateItem(group.id, item.id, col.id, newStatusId)}
          />
        );
      case 'person':
        return (
          <div className="cell-content cell-center">
            {item[col.id] ? (
              <div className="avatar" title={item[col.id]} onClick={() => updateItem(group.id, item.id, col.id, '')} style={{cursor: 'pointer'}}>{getInitials(item[col.id])}</div>
            ) : (
              <input 
                type="text" 
                placeholder="+" 
                className="inline-input" 
                style={{textAlign: 'center'}}
                onBlur={(e) => updateItem(group.id, item.id, col.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { updateItem(group.id, item.id, col.id, e.target.value); e.target.blur(); } }}
              />
            )}
          </div>
        );
      case 'date':
        return (
          <div className="cell-content cell-center">
            <input 
              type="date" 
              className="inline-input" 
              style={{textAlign: 'center', color: 'var(--text-muted)'}}
              value={item[col.id] || ''} 
              onChange={(e) => updateItem(group.id, item.id, col.id, e.target.value)}
            />
          </div>
        );
      case 'timeline':
        const timelineObj = item[col.id] || { start: '', end: '' };
        return (
          <div className="cell-content cell-center" style={{ gap: '4px', padding: '0 4px' }}>
            <input 
              type="date" 
              className="inline-input" 
              style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem'}}
              value={timelineObj.start || ''} 
              onChange={(e) => updateItem(group.id, item.id, col.id, { ...timelineObj, start: e.target.value })}
            />
            <span style={{color: 'var(--text-muted)'}}>-</span>
            <input 
              type="date" 
              className="inline-input" 
              style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem'}}
              value={timelineObj.end || ''} 
              onChange={(e) => updateItem(group.id, item.id, col.id, { ...timelineObj, end: e.target.value })}
            />
          </div>
        );
      case 'link':
        return (
          <div className="cell-content" style={{ display: 'flex', gap: '8px', padding: '0 8px' }}>
            <input 
              type="text" 
              className="inline-input" 
              value={item[col.id] || ''} 
              placeholder="Add link..."
              onChange={(e) => updateItem(group.id, item.id, col.id, e.target.value)}
              style={{ color: 'var(--accent-blue)', flex: 1 }}
            />
            {item[col.id] && (
              <a href={item[col.id].startsWith('http') ? item[col.id] : `https://${item[col.id]}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <FiExternalLink />
              </a>
            )}
          </div>
        );
      case 'number':
        return (
          <div className="cell-content cell-center">
            <input 
              type="number" 
              className="inline-input" 
              value={item[col.id] || ''} 
              placeholder="0"
              onChange={(e) => updateItem(group.id, item.id, col.id, e.target.value)}
              style={{ textAlign: 'center' }}
            />
          </div>
        );
      case 'checkbox':
        return (
          <div className="cell-content cell-center">
            <input 
              type="checkbox"
              checked={!!item[col.id]}
              onChange={(e) => updateItem(group.id, item.id, col.id, e.target.checked)}
              style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
            />
          </div>
        );
      case 'rating':
        const rating = parseInt(item[col.id]) || 0;
        return (
          <div className="cell-content cell-center" style={{ gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <FiStar 
                key={star}
                size={18}
                style={{ 
                  cursor: 'pointer', 
                  color: star <= rating ? '#fdab3d' : 'var(--border-color)',
                  fill: star <= rating ? '#fdab3d' : 'none'
                }}
                onClick={() => updateItem(group.id, item.id, col.id, rating === star ? 0 : star)}
              />
            ))}
          </div>
        );
      case 'text':
      default:
        return (
          <div className="cell-content">
            <input 
              type="text" 
              className="inline-input" 
              value={item[col.id] || ''} 
              placeholder="-"
              onChange={(e) => updateItem(group.id, item.id, col.id, e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <div className="board-container" ref={tableContainerRef}>
      {groups.map((group) => (
        <div key={group.id} className="group-section">
          
          <div className="group-header">
            <FiChevronDown style={{ color: group.color }} />
            <div className="group-header-title">
              {group.isVirtual ? (
                <span style={{ color: group.color, fontWeight: 500, fontSize: '1.1rem', padding: '2px 0' }}>{group.title}</span>
              ) : (
                <input 
                  type="text" 
                  value={group.title} 
                  onChange={(e) => renameGroup(group.id, e.target.value)}
                  style={{ color: group.color, fontWeight: 500, fontSize: '1.1rem' }}
                />
              )}
            </div>
            {!group.isVirtual && (
              <div className="group-header-actions">
                <button onClick={() => deleteGroup(group.id)} title="Delete Group">
                  <FiTrash2 />
                </button>
              </div>
            )}
          </div>

          <table className="monday-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th style={{ textAlign: 'left', paddingLeft: '1rem', width: '350px' }}>Item</th>
                
                {columns.map(col => {
                  if (hiddenColumns.includes(col.id)) return null;
                  return (
                    <th 
                      key={col.id} 
                      style={{ width: col.width ? `${col.width}px` : 'auto', position: 'relative' }} 
                      className="column-header"
                      draggable
                      onDragStart={(e) => handleDragStart(e, col.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, col.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
                        <input 
                          type="text" 
                          value={col.title}
                          onChange={(e) => renameColumn(boardId, col.id, e.target.value)}
                          style={{ 
                            background: 'transparent', border: 'none', color: 'inherit', fontWeight: 'inherit', 
                            textAlign: 'center', width: '100%', cursor: 'text', padding: '0.2rem'
                          }}
                        />
                        <div className="column-delete-btn" onClick={() => deleteColumn(boardId, col.id)} title="Delete Column">
                          <FiTrash2 size={12} />
                        </div>
                      </div>
                      
                      {/* Resizer Handle */}
                      <div 
                        onMouseDown={(e) => handleResizeStart(e, col)}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: '5px',
                          cursor: 'col-resize',
                          backgroundColor: resizingCol?.id === col.id ? 'var(--accent-blue)' : 'transparent',
                          transition: 'background-color 0.2s',
                          zIndex: 10
                        }}
                        className="col-resizer"
                      />
                    </th>
                  );
                })}
                
                <th style={{ width: '40px', position: 'relative' }}>
                  <div 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', height: '100%', width: '100%' }}
                    onClick={() => setOpenColumnMenuGroupId(openColumnMenuGroupId === group.id ? null : group.id)}
                    className="add-column-hover"
                  >
                    <FiPlus size={16} />
                  </div>
                  {openColumnMenuGroupId === group.id && (
                    <div className="action-popover" style={{ right: 0, left: 'auto', width: '200px', top: '100%', zIndex: 100 }}>
                      <div style={{ fontWeight: 600, padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Add Column</div>
                      <div className="popover-option" onClick={() => handleAddNewColumn('text', 'Text')}>📝 Text</div>
                      <div className="popover-option" onClick={() => handleAddNewColumn('number', 'Numbers')}>🔢 Numbers</div>
                      <div className="popover-option" onClick={() => handleAddNewColumn('status', 'Status')}>📊 Status</div>
                      <div className="popover-option" onClick={() => handleAddNewColumn('person', 'Person')}>👤 Person</div>
                      <div className="popover-option" onClick={() => handleAddNewColumn('date', 'Date')}>📅 Date</div>
                      <div className="popover-option" onClick={() => handleAddNewColumn('timeline', 'Timeline')}>⏳ Timeline</div>
                      <div className="popover-option" onClick={() => handleAddNewColumn('link', 'Link')}>🔗 Link</div>
                      <div className="popover-option" onClick={() => handleAddNewColumn('checkbox', 'Checkbox')}>☑️ Checkbox</div>
                      <div className="popover-option" onClick={() => handleAddNewColumn('rating', 'Rating')}>⭐ Rating</div>
                    </div>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {group.items.map(item => {
                return (
                  <tr key={item.id}>
                    <td className="cell-checkbox">
                      <div className="group-color-indicator" style={{ backgroundColor: group.color }}></div>
                      <input type="checkbox" />
                    </td>
                    <td>
                      <div className="cell-content" style={{ justifyContent: 'space-between' }}>
                        <input 
                          type="text" 
                          className="inline-input" 
                          value={item.title} 
                          onChange={(e) => updateItem(group.id, item.id, 'title', e.target.value)}
                        />
                        <div className="row-actions" onClick={() => deleteItem(group.id, item.id)}>
                          <FiTrash2 />
                        </div>
                      </div>
                    </td>
                    
                    {columns.map(col => {
                      if (hiddenColumns.includes(col.id)) return null;
                      return (
                        <td key={col.id}>
                          {renderCell(group, item, col)}
                        </td>
                      );
                    })}
                    
                    <td></td>
                  </tr>
                );
              })}
              
              {!group.isVirtual && (
                <tr className="add-item-row">
                  <td className="cell-checkbox">
                    <div className="group-color-indicator" style={{ backgroundColor: group.color }}></div>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="add-item-input" 
                      placeholder="+ Add item (Press Enter)"
                      value={newItems[group.id] || ''}
                      onChange={(e) => setNewItems({...newItems, [group.id]: e.target.value})}
                      onKeyDown={(e) => handleAddSubmit(e, group.id)}
                    />
                  </td>
                  
                  {columns.map(col => {
                    if (hiddenColumns.includes(col.id)) return null;
                    return <td key={col.id}></td>;
                  })}
                  
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
          
        </div>
      ))}

      {!isGroupedByStatus && (
        <button className="btn-outline" onClick={addGroup}>
          <FiPlus /> Add new group
        </button>
      )}
    </div>
  );
};

export default TableView;
