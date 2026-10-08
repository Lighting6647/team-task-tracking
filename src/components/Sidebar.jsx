import React, { useState, useRef, useEffect } from 'react';
import { FiGrid, FiFolder, FiSearch, FiMoreHorizontal, FiPlus, FiLayout, FiChevronDown, FiChevronRight, FiFileText, FiEdit2, FiTrash2, FiHome, FiCheckSquare, FiVideo, FiStar, FiX, FiCopy } from 'react-icons/fi';

const Sidebar = ({ 
  boards, activeBoardId, onSelectBoard, onAddBoard, onDeleteBoard, onRenameBoard, onMoveBoard,
  activeSpecialView, onSelectSpecialView, onResetToBlank,
  isOpen = true, onClose, onDuplicateBoard
}) => {
  const handleNavigate = (action) => {
    if (typeof action === 'function') action();
    if (onClose && typeof window !== 'undefined' && window.innerWidth <= 1024) {
      onClose();
    }
  };
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(['board-passapp-1']);
  const menuRef = useRef(null);
  const actionMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAddMenu(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActionMenuId(null);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
      if (isSearching && searchInputRef.current && !searchInputRef.current.contains(event.target) && !searchQuery) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearching, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    setExpandedFolders(prev => ({ ...prev, [id]: prev[id] === false ? true : false }));
  };

  const isSearchActive = searchQuery.trim().length > 0;
  const filteredBoards = boards
    .filter(b => (!showFavoritesOnly || favorites.includes(b.id)))
    .filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderItem = (board, depth = 0) => {
    const isFolder = board.type === 'folder';
    const children = boards.filter(b => b.parentId === board.id);
    const isExpanded = expandedFolders[board.id] !== false;

    return (
      <React.Fragment key={board.id}>
        <div 
          draggable
          onDragStart={(e) => handleDragStart(e, board)}
          onDragOver={(e) => handleDragOver(e, board)}
          onDragLeave={(e) => handleDragLeave(e, board)}
          onDrop={(e) => handleDrop(e, board)}
          className={`sidebar-menu-item ${!activeSpecialView && board.id === activeBoardId ? 'active' : ''} ${dragOverId === board.id ? 'drag-over' : ''}`}
          onClick={() => isFolder ? toggleFolder({stopPropagation: () => {}}, board.id) : handleNavigate(() => onSelectBoard(board.id))}
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
              {!isFolder && onDuplicateBoard && (
                <div className="add-menu-item" onClick={(e) => { e.stopPropagation(); onDuplicateBoard(board.id); setActionMenuId(null); }}>
                  <FiCopy color="#fdab3d" /> Duplicate
                </div>
              )}
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
              <div 
                className="add-menu-item" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setFavorites(prev => prev.includes(board.id) ? prev.filter(id => id !== board.id) : [...prev, board.id]); 
                  setActionMenuId(null); 
                }}
              >
                <FiStar color={favorites.includes(board.id) ? '#fdab3d' : 'var(--text-muted)'} /> {favorites.includes(board.id) ? 'Remove Favorite' : 'Favorite'}
              </div>
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

  const rootItems = boards
    .filter(b => (!showFavoritesOnly || favorites.includes(b.id) || boards.some(child => child.parentId === b.id && favorites.includes(child.id))))
    .filter(b => !b.parentId || !boards.some(p => p.id === b.parentId));

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
      {/* Sidebar Brand Header with Mobile Close Button */}
      <div className="sidebar-brand-header">
        <div className="sidebar-brand-badge">
          <span style={{ fontSize: '1.15rem' }}>⚡</span>
          <span>LightBeam OS</span>
        </div>
        {onClose && (
          <button 
            type="button"
            className="sidebar-close-btn" 
            onClick={onClose}
            aria-label="Close menu"
            title="ปิดเมนู"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Top Navigation Items */}
      <div style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div 
          className={`sidebar-menu-item ${!activeSpecialView && activeBoardId === 'board-passapp-1' ? 'active' : ''}`}
          onClick={() => {
            handleNavigate(() => {
              if (onSelectSpecialView) onSelectSpecialView(null);
              const firstGrid = boards.find(b => b.type === 'grid');
              if (firstGrid) onSelectBoard(firstGrid.id);
            });
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <FiHome size={18} /> Home
        </div>

        <div 
          className={`sidebar-menu-item ${activeSpecialView === 'my-work' ? 'active' : ''}`}
          onClick={() => {
            handleNavigate(() => {
              if (onSelectSpecialView) onSelectSpecialView('my-work');
            });
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <FiCheckSquare size={18} /> My work
        </div>

        <div 
          className={`sidebar-menu-item ${activeSpecialView === 'ai-notetaker' ? 'active' : ''}`}
          onClick={() => {
            handleNavigate(() => {
              if (onSelectSpecialView) onSelectSpecialView('ai-notetaker');
            });
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <FiVideo size={18} /> AI Notetaker
        </div>

        <div 
          ref={moreMenuRef}
          className="sidebar-menu-item"
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', cursor: 'pointer', position: 'relative' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiMoreHorizontal size={18} /> More
          </div>
          <FiChevronDown size={14} style={{ transform: showMoreMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />

          {showMoreMenu && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: '10px',
                zIndex: 100,
                background: '#20243f',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '6px',
                minWidth: '220px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="add-menu-item"
                onClick={() => {
                  handleNavigate(() => {
                    const dashboardBoard = boards.find(b => b.type === 'dashboard');
                    if (dashboardBoard) {
                      if (onSelectSpecialView) onSelectSpecialView(null);
                      onSelectBoard(dashboardBoard.id);
                    }
                  });
                  setShowMoreMenu(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
              >
                <FiLayout color="#579bfc" /> แดชบอร์ดสรุปผลรวม (Dashboard)
              </div>
              <div 
                className="add-menu-item"
                onClick={() => {
                  if (window.confirm("คุณต้องการรีเซ็ตเป็นบอร์ดว่างเปล่า (Blank Board) ใช่หรือไม่? ข้อมูลตัวอย่างจะถูกล้าง")) {
                    if (onResetToBlank) onResetToBlank();
                    setShowMoreMenu(false);
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer', color: '#ff6b6b' }}
              >
                <FiTrash2 color="#ff6b6b" /> รีเซ็ตเป็นบอร์ดว่าง (Reset to Blank)
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div 
        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        style={{ 
          padding: '0.6rem 1rem', 
          fontSize: '0.8rem', 
          color: showFavoritesOnly ? 'var(--accent-blue)' : 'var(--text-muted)', 
          marginTop: '0.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderRadius: '4px'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiStar size={14} color={showFavoritesOnly ? '#fdab3d' : 'currentColor'} />
          Favorites {showFavoritesOnly && '(เปิดใช้งาน)'}
        </span>
        <FiChevronRight size={12} style={{ transform: showFavoritesOnly ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
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
              onClick={() => handleNavigate(() => onSelectBoard(board.id))}
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
    </aside>
  );
}

export default Sidebar;
