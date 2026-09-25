import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiPlus, FiTrash2, FiExternalLink, FiStar } from 'react-icons/fi';
import StatusDropdown from './StatusDropdown';

const TableView = ({ 
  boardId, columns = [], groups, updateItem, addItem, addSubitem, deleteItem, addGroup, deleteGroup, renameGroup, 
  addColumn, renameColumn, deleteColumn, updateColumnOptions, updateColumnWidth, reorderColumns,
  hiddenColumns = [], isGroupedByStatus = false, onOpenItem, reorderItem
}) => {
  const [newItems, setNewItems] = useState({});
  const [newSubitems, setNewSubitems] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [openColumnMenuGroupId, setOpenColumnMenuGroupId] = useState(null);
  const [resizingCol, setResizingCol] = useState(null);
  const tableContainerRef = useRef(null);

  const toggleSelection = (groupId, itemId, parentId = null) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.itemId === itemId);
      if (exists) return prev.filter(i => i.itemId !== itemId);
      return [...prev, { groupId, itemId, parentId }];
    });
  };

  const clearSelection = () => setSelectedItems([]);

  const handleBulkDelete = () => {
    selectedItems.forEach(item => {
      deleteItem(item.groupId, item.itemId, item.parentId);
    });
    clearSelection();
  };

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

  const handleColDragStart = (e, colId) => {
    e.dataTransfer.setData('text/plain', colId);
  };

  const handleColDragOver = (e) => {
    e.preventDefault();
  };

  const handleColDrop = (e, targetColId) => {
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

  const handleAddSubitemSubmit = (e, groupId, parentId) => {
    if (e.key === 'Enter') {
      const val = newSubitems[parentId];
      if (val && val.trim() && addSubitem) {
        addSubitem(groupId, parentId, val.trim());
        setNewSubitems({ ...newSubitems, [parentId]: '' });
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

  const renderSummaryCell = (group, col) => {
    if (!group.items || group.items.length === 0) return null;

    if (col.type === 'status') {
      const counts = {};
      let total = 0;
      group.items.forEach(item => {
        const val = item[col.id];
        if (val) {
          counts[val] = (counts[val] || 0) + 1;
          total++;
        }
      });

      if (total === 0) return <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>;

      return (
        <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', width: '100%' }}>
          {col.options.map(opt => {
            const count = counts[opt.id] || 0;
            if (count === 0) return null;
            const percentage = (count / total) * 100;
            return (
              <div 
                key={opt.id} 
                style={{ width: `${percentage}%`, background: opt.color }} 
                title={`${opt.label}: ${count} (${Math.round(percentage)}%)`}
              />
            );
          })}
        </div>
      );
    }
    
    if (col.type === 'number') {
      const sum = group.items.reduce((acc, item) => {
        const val = parseFloat(item[col.id]);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      return <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>{sum !== 0 ? sum : ''}</div>;
    }
    
    return null;
  };

  const [draggedItem, setDraggedItem] = useState(null);

  const handleRowDragStart = (e, groupId, itemId) => {
    // Only drag if not grouping by status (read-only view)
    if (isGroupedByStatus) {
      e.preventDefault();
      return;
    }
    setDraggedItem({ groupId, itemId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'item', groupId, itemId }));
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleRowDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleRowDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleRowDrop = (e, targetGroupId, targetItemId = null) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;
    
    // Only handle item drops, not column drops (if any)
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'item' && reorderItem) {
        reorderItem(data.groupId, data.itemId, targetGroupId, targetItemId);
      }
    } catch(err) {}
    setDraggedItem(null);
  };

  const renderCell = (group, item, col, parentId = null) => {
    switch(col.type) {
      case 'status':
        return (
          <StatusDropdown 
            statusId={item[col.id]} 
            statusOptions={col.options || []}
            setStatusOptions={(newOptions) => updateColumnOptions(boardId, col.id, newOptions)}
            onStatusChange={(newStatusId) => updateItem(group.id, item.id, col.id, newStatusId, parentId)}
          />
        );
      case 'person':
        return (
          <div className="cell-content cell-center">
            {item[col.id] ? (
              <div className="avatar" title={item[col.id]} onClick={() => updateItem(group.id, item.id, col.id, '', parentId)} style={{cursor: 'pointer'}}>{getInitials(item[col.id])}</div>
            ) : (
              <input 
                type="text" 
                placeholder="+" 
                className="inline-input" 
                style={{textAlign: 'center'}}
                onBlur={(e) => updateItem(group.id, item.id, col.id, e.target.value, parentId)}
                onKeyDown={(e) => { if (e.key === 'Enter') { updateItem(group.id, item.id, col.id, e.target.value, parentId); e.target.blur(); } }}
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
              onChange={(e) => updateItem(group.id, item.id, col.id, e.target.value, parentId)}
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
              onChange={(e) => updateItem(group.id, item.id, col.id, { ...timelineObj, start: e.target.value }, parentId)}
            />
            <span style={{color: 'var(--text-muted)'}}>-</span>
            <input 
              type="date" 
              className="inline-input" 
              style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem'}}
              value={timelineObj.end || ''} 
              onChange={(e) => updateItem(group.id, item.id, col.id, { ...timelineObj, end: e.target.value }, parentId)}
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
              onChange={(e) => updateItem(group.id, item.id, col.id, e.target.value, parentId)}
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
              onChange={(e) => updateItem(group.id, item.id, col.id, e.target.value, parentId)}
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
              onChange={(e) => updateItem(group.id, item.id, col.id, e.target.checked, parentId)}
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
                onClick={() => updateItem(group.id, item.id, col.id, rating === star ? 0 : star, parentId)}
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
              onChange={(e) => updateItem(group.id, item.id, col.id, e.target.value, parentId)}
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

          <table 
            className="monday-table"
            onDragOver={handleRowDragOver}
            onDrop={(e) => handleRowDrop(e, group.id, null)}
          >
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
                      onDragStart={(e) => handleColDragStart(e, col.id)}
                      onDragOver={handleRowDragOver}
                      onDrop={(e) => handleColDrop(e, col.id)}
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
                const isExpanded = expandedItems[item.id];
                const hasSubitems = item.subitems && item.subitems.length > 0;
                
                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      draggable={!isGroupedByStatus}
                      onDragStart={(e) => handleRowDragStart(e, group.id, item.id)}
                      onDragEnd={handleRowDragEnd}
                      onDragOver={handleRowDragOver}
                      onDrop={(e) => handleRowDrop(e, group.id, item.id)}
                      style={{ cursor: !isGroupedByStatus ? 'grab' : 'default' }}
                    >
                      <td className="cell-checkbox">
                    <div className="group-color-indicator" style={{ backgroundColor: group.color || 'var(--accent-blue)' }}></div>
                    <div style={{ opacity: hoveredItemId === item.id ? 1 : 0, transition: 'opacity 0.2s', width: '14px', height: '14px', border: '1px solid var(--border-color)', borderRadius: '2px', margin: '0 auto', cursor: 'pointer' }}></div>
                  </td>
                      <td>
                        <div className="cell-content" style={{ justifyContent: 'space-between', paddingRight: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '4px' }}>
                            <div 
                              onClick={() => setExpandedItems(prev => ({...prev, [item.id]: !prev[item.id]}))}
                              style={{ cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center', width: '16px' }}
                            >
                              {(hasSubitems || isExpanded) ? (isExpanded ? <FiChevronDown size={14} /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>) : null}
                            </div>
                            <input 
                              type="text" 
                              className="inline-input" 
                              value={item.title} 
                              onChange={(e) => updateItem(group.id, item.id, 'title', e.target.value)}
                              style={{ flex: 1 }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {!hasSubitems && !isExpanded && (
                              <div 
                                className="row-actions" 
                                style={{ opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => setExpandedItems(prev => ({...prev, [item.id]: true}))}
                                title="Add subitem"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
                              </div>
                            )}
                            <div 
                              className="row-actions" 
                              style={{ opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => onOpenItem && onOpenItem(group.id, item.id)}
                              title="Open task details"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                              {(item.updates?.length > 0) && (
                                <span style={{ marginLeft: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{item.updates.length}</span>
                              )}
                            </div>
                            <div className="row-actions" onClick={() => deleteItem(group.id, item.id)}>
                              <FiTrash2 />
                            </div>
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
                    
                    {/* Subitems */}
                    {isExpanded && (item.subitems || []).map(subitem => (
                      <tr key={subitem.id} style={{ background: 'rgba(0,0,0,0.1)' }}>
                        <td className="cell-checkbox">
                    <div className="group-color-indicator" style={{ backgroundColor: group.color || 'var(--accent-blue)' }}></div>
                    <div style={{ opacity: hoveredItemId === item.id ? 1 : 0, transition: 'opacity 0.2s', width: '14px', height: '14px', border: '1px solid var(--border-color)', borderRadius: '2px', margin: '0 auto', cursor: 'pointer' }}></div>
                  </td>
                        <td>
                          <div className="cell-content" style={{ justifyContent: 'space-between', paddingRight: '8px', paddingLeft: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', opacity: 0.3 }}><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
                              <input 
                                type="text" 
                                className="inline-input" 
                                value={subitem.title} 
                                onChange={(e) => updateItem(group.id, subitem.id, 'title', e.target.value, item.id)}
                                style={{ flex: 1 }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <div className="row-actions" onClick={() => deleteItem(group.id, subitem.id, item.id)}>
                                <FiTrash2 />
                              </div>
                            </div>
                          </div>
                        </td>
                        {columns.map(col => {
                          if (hiddenColumns.includes(col.id)) return null;
                          return (
                            <td key={col.id}>
                              {/* Wrap renderCell so it uses parentId for updates */}
                              {React.cloneElement(renderCell(group, subitem, col) || <div/>, {
                                onChange: (e) => updateItem(group.id, subitem.id, col.id, e.target?.value || e, item.id)
                              })}
                            </td>
                          );
                        })}
                        <td></td>
                      </tr>
                    ))}
                    
                    {/* Add Subitem Row */}
                    {isExpanded && !group.isVirtual && (
                      <tr className="add-item-row" style={{ background: 'rgba(0,0,0,0.05)' }}>
                        <td className="cell-checkbox">
                    <div className="group-color-indicator" style={{ backgroundColor: group.color || 'var(--accent-blue)' }}></div>
                    <div style={{ opacity: hoveredItemId === item.id ? 1 : 0, transition: 'opacity 0.2s', width: '14px', height: '14px', border: '1px solid var(--border-color)', borderRadius: '2px', margin: '0 auto', cursor: 'pointer' }}></div>
                  </td>
                        <td>
                          <div style={{ paddingLeft: '24px' }}>
                            <input 
                              type="text" 
                              className="add-item-input" 
                              placeholder="+ Add subitem (Press Enter)"
                              value={newSubitems[item.id] || ''}
                              onChange={(e) => setNewSubitems({...newSubitems, [item.id]: e.target.value})}
                              onKeyDown={(e) => handleAddSubitemSubmit(e, group.id, item.id)}
                            />
                          </div>
                        </td>
                        {columns.map(col => {
                          if (hiddenColumns.includes(col.id)) return null;
                          return <td key={col.id}></td>;
                        })}
                        <td></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              
              {/* Add Item Row */}
              <tr>
                <td className="cell-checkbox">
                  <div className="group-color-indicator" style={{ backgroundColor: group.color, opacity: 0.5 }}></div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '8px' }}>
                    <input 
                      type="text" 
                      className="add-item-input" 
                      placeholder="+ Add item (Press Enter)"
                      value={newItems[group.id] || ''}
                      onChange={(e) => setNewItems({...newItems, [group.id]: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          addItem(group.id, e.target.value);
                          setNewItems({...newItems, [group.id]: ''});
                        }
                      }}
                    />
                  </div>
                </td>
                {columns.map(col => {
                  if (hiddenColumns.includes(col.id)) return null;
                  return <td key={col.id}></td>;
                })}
                <td></td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td style={{ borderBottom: 'none' }}></td>
                <td style={{ borderBottom: 'none' }}></td>
                {columns.map(col => {
                  if (hiddenColumns.includes(col.id)) return null;
                  return (
                    <td key={col.id} style={{ padding: '0.75rem', borderBottom: 'none' }}>
                      {renderSummaryCell(group, col)}
                    </td>
                  );
                })}
                <td style={{ borderBottom: 'none' }}></td>
              </tr>
            </tfoot>
          </table>
          
        </div>
      ))}

      {!isGroupedByStatus && (
        <button className="btn-outline" onClick={addGroup}>
          <FiPlus /> Add new group
        </button>
      )}

      {selectedItems.length > 0 && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-glass)', padding: '1rem 2rem', borderRadius: '12px', boxShadow: '0 8px 32px var(--glass-shadow)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1000, backdropFilter: 'blur(16px)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedItems.length} items selected</div>
          <button className="btn-danger" onClick={handleBulkDelete}><FiTrash2 /> Delete</button>
          <button className="btn-outline" onClick={clearSelection}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default TableView;
