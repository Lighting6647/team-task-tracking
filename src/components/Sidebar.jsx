import React, { useState, useRef, useEffect } from 'react';
import { FiGrid, FiFolder, FiSearch, FiMoreHorizontal, FiPlus, FiLayout, FiChevronDown, FiChevronRight, FiFileText, FiEdit2, FiTrash2 , FiHome, FiCheckSquare, FiVideo, FiStar} from 'react-icons/fi';

const Sidebar = ({ boards, activeBoardId, onSelectBoard, onAddBoard, onDeleteBoard, onRenameBoard, onMoveBoard }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuParentId, setAddMenuParentId] = useState(null);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [draggedBoardId, setDraggedBoardId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const menuRef = useRef(null);
  const actionMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActionMenuId(null);
      }
      if (isSearching && searchInputRef.current && !searchInputRef.current.contains(event.target) && !searchQuery) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearching, searchQuery]);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this item and all its data?')) {
      onDeleteBoard(id);
      setActionMenuId(null);
    }
  };

  const openActionMenu = (e, id) => {
    e.stopPropagation();
    setActionMenuId(id);
  };

  const handleRenameSubmit = (e, id) => {
    if (e.key === 'Enter') {
      onRenameBoard(id, editTitle);
      setEditingBoardId(null);
    } else if (e.key === 'Escape') {
      setEditingBoardId(null);
    }
  };

  const handleAdd = (type, parentId = addMenuParentId) => {
    onAddBoard(type, parentId);
    setShowAddMenu(false);
    if (parentId) {
      setExpandedFolders(prev => ({ ...prev, [parentId]: true }));
    }
  };

  const openAddMenu = (e, parentId = null) => {
    e.stopPropagation();
    setAddMenuParentId(parentId);
    setShowAddMenu(true);
  };

  const handleDragStart = (e, board) => {
    e.stopPropagation();
    setDraggedBoardId(board.id);
    e.dataTransfer.setData('text/plain', board.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, board) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedBoardId === board.id) return;
    
    // Only folders can be drop targets for moving inside
    if (board.type === 'folder' && dragOverId !== board.id) {
      setDragOverId(board.id);
    }
  };

  const handleDragLeave = (e, board) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverId === board.id) {
      setDragOverId(null);
    }
  };

  const handleDrop = (e, targetBoard) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(null);
    
    if (!draggedBoardId || draggedBoardId === targetBoard.id) return;

    if (targetBoard.type === 'folder') {
      // Prevent cyclic parent assignment
      let current = targetBoard;
      let isCyclic = false;
      while (current) {
        if (current.id === draggedBoardId) {
          isCyclic = true;
          break;
        }
        current = boards.find(b => b.id === current.parentId);
      }

      if (!isCyclic) {
        onMoveBoard(draggedBoardId, targetBoard.id);
        setExpandedFolders(prev => ({ ...prev, [targetBoard.id]: true }));
      }
    }
    setDraggedBoardId(null);
  };

  const handleRootDragOver = (e) => {
    e.preventDefault();
    if (draggedBoardId && dragOverId !== 'root') {
      setDragOverId('root');
    }
  };

  const handleRootDragLeave = (e) => {
    e.preventDefault();
    if (dragOverId === 'root') {
      setDragOverId(null);
    }
  };

  const handleRootDrop = (e) => {
    e.preventDefault();
    setDragOverId(null);
    if (draggedBoardId) {
      onMoveBoard(draggedBoardId, null);
    }
    setDraggedBoardId(null);
  };

  const renderIcon = (type, color) => {
    if (type === 'folder') return <FiFolder color={color} />;
    if (type === 'dashboard') return <FiLayout color={color} />;
    if (type === 'doc') return <FiFileText color={color} />;
    return <FiGrid color={color} />;
  };

  const toggleFolder = (e, id) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isSearchActive = searchQuery.trim().length > 0;
  const filteredBoards = boards.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderItem = (board, depth = 0) => {
    const isFolder = board.type === 'folder';
    const children = boards.filter(b => b.parentId === board.id);
    const isExpanded = expandedFolders[board.id];

    return (
      <React.Fragment key={board.id}>
        <div 
          draggable
          onDragStart={(e) => handleDragStart(e, board)}
          onDragOver={(e) => handleDragOver(e, board)}
          onDragLeave={(e) => handleDragLeave(e, board)}
          onDrop={(e) => handleDrop(e, board)}
          className={`sidebar-menu-item ${board.id === activeBoardId ? 'active' : ''} ${dragOverId === board.id ? 'drag-over' : ''}`}
          onClick={() => isFolder ? toggleFolder({stopPropagation: () => {}}, board.id) : onSelectBoard(board.id)}
          onMouseEnter={() => setHoveredId(board.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            paddingLeft: `${1 + depth * 1.5}rem`, 
            position: 'relative',
            opacity: draggedBoardId === board.id ? 0.5 : 1,
            backgroundColor: dragOverId === board.id ? 'rgba(0, 133, 255, 0.2)' : undefined,
            border: dragOverId === board.id ? '1px dashed var(--accent-blue)' : undefined
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {isFolder && (
              <span onClick={(e) => toggleFolder(e, board.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
              </span>
            )}
            {!isFolder && <span style={{ width: '14px' }}></span>}
            {renderIcon(board.type, board.color || 'var(--accent-blue)')}
            {editingBoardId === board.id ? (
              <input 
                type="text" 
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => handleRenameSubmit(e, board.id)}
                onBlur={() => { onRenameBoard(board.id, editTitle); setEditingBoardId(null); }}
                style={{ 
                  background: 'rgba(0,0,0,0.5)', border: '1px solid var(--accent-blue)', 
                  color: 'white', borderRadius: '4px', padding: '2px 4px', width: '120px' 
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{board.title}</span>
            )}
          </div>
          
          {hoveredId === board.id && (
            <div style={{ display: 'flex', gap: '4px' }}>
              {isFolder && (
                <div className="sidebar-item-actions" onClick={(e) => openAddMenu(e, board.id)} title="Add to folder">
                  <FiPlus size={16} />
                </div>
              )}
              <div className="sidebar-item-actions" onClick={(e) => openActionMenu(e, board.id)} title="Options">
                <FiMoreHorizontal size={16} />
              </div>
            </div>
          )}
          
          {actionMenuId === board.id && (
            <div ref={actionMenuRef} className="add-menu-dropdown" style={{ zIndex: 1000, right: '10px', left: 'auto', top: '30px' }}>
              <div className="add-menu-item" onClick={(e) => { e.stopPropagation(); setEditingBoardId(board.id); setEditTitle(board.title); setActionMenuId(null); }}>
                <FiEdit2 color="var(--accent-blue)" /> Rename
              </div>
              {isFolder && (
                <>
                  <div className="add-menu-item" onClick={(e) => { e.stopPropagation(); handleAdd('grid', board.id); setActionMenuId(null); }}>
                    <FiGrid color="var(--accent-blue)" /> Add Board inside
                  </div>
                  <div className="add-menu-item" onClick={(e) => { e.stopPropagation(); handleAdd('doc', board.id); setActionMenuId(null); }}>
                    <FiFileText color="var(--accent-purple)" /> Add Doc inside
                  </div>
                </>
              )}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '4px 0' }}></div>
              <div className="add-menu-item" style={{ color: 'var(--danger-color, #ff4d4d)' }} onClick={(e) => { e.stopPropagation(); handleDelete(board.id, e); }}>
                <FiTrash2 color="var(--danger-color, #ff4d4d)" /> Delete
              </div>
            </div>
          )}
        </div>
        {isFolder && isExpanded && !isSearchActive && children.map(child => renderItem(child, depth + 1))}
      </React.Fragment>
    );
  };

  const rootItems = boards.filter(b => !b.parentId);

  return (
    <div className="sidebar">
      {/* Top Static Items */}
      <div style={{ padding: '1rem 0' }}>
        <div className="sidebar-menu-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><FiHome size={18} /> Home</div>
        <div className="sidebar-menu-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><FiCheckSquare size={18} /> My work</div>
        <div className="sidebar-menu-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><FiVideo size={18} /> AI Notetaker</div>
        <div className="sidebar-menu-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><FiMoreHorizontal size={18} /> More</div>
      </div>
      
      <div style={{ padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Favorites <FiChevronRight size={12} />
      </div>

      <div style={{ padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Workspaces</span>
        <FiMoreHorizontal size={14} style={{ cursor: 'pointer' }} />
      </div>
      
      <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '24px', height: '24px', backgroundColor: '#e2445c', color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>M</div>
        <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>Main workspace</span>
        <button 
          className="btn-primary" 
          style={{ padding: '2px 6px', borderRadius: '4px' }}
          onClick={(e) => openAddMenu(e, null)}
        >
          <FiPlus />
        </button>
      </div>

      <div style={{ padding: '0.5rem 1rem', position: 'relative' }} ref={menuRef}>
        {isSearching ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }} ref={searchInputRef}>
            <FiSearch size={14} color="var(--text-muted)" />
            <input 
              type="text" 
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', outline: 'none', width: '100%', fontSize: '0.9rem' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <FiSearch size={14} onClick={() => setIsSearching(true)} style={{ cursor: 'pointer' }} />
            <span style={{ flex: 1 }} onClick={() => setIsSearching(true)}>Search</span>
          </div>
        )}
        
        {showAddMenu && (
          <div className="add-menu-dropdown" style={{ zIndex: 1000, top: '40px' }}>
            <div className="add-menu-item" onClick={() => handleAdd('grid')}>
              <FiGrid color="var(--accent-blue)" /> New Board
            </div>
            <div className="add-menu-item" onClick={() => handleAdd('doc')}>
              <FiFileText color="var(--accent-purple)" /> New Document
            </div>
            <div className="add-menu-item" onClick={() => handleAdd('dashboard')}>
              <FiLayout color="var(--group-color-3)" /> New Dashboard
            </div>
            <div className="add-menu-item" onClick={() => handleAdd('folder')}>
              <FiFolder color="#fdab3d" /> New Folder
            </div>
          </div>
        )}
      </div>

      <div 
        className="sidebar-content"
        onDragOver={handleRootDragOver}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
        style={{ 
          backgroundColor: dragOverId === 'root' ? 'rgba(0, 133, 255, 0.05)' : undefined,
          minHeight: '100px',
          overflowY: 'auto',
          flex: 1
        }}
      >
        {isSearchActive ? (
          filteredBoards.map(board => (
            <div 
              key={board.id} 
              className={`sidebar-menu-item ${board.id === activeBoardId ? 'active' : ''}`}
              onClick={() => onSelectBoard(board.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1rem' }}
            >
              {renderIcon(board.type, board.color || 'var(--accent-blue)')}
              {board.title}
            </div>
          ))
        ) : (
          rootItems.map(board => renderItem(board))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
