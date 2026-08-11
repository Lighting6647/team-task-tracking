import React, { useState, useRef, useEffect } from 'react';
import { FiGrid, FiFolder, FiSearch, FiMoreHorizontal, FiPlus, FiLayout } from 'react-icons/fi';

const Sidebar = ({ boards, activeBoardId, onSelectBoard, onAddBoard, onDeleteBoard }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAddMenu(false);
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
    }
  };

  const handleAdd = (type) => {
    onAddBoard(type);
    setShowAddMenu(false);
  };

  const renderIcon = (type, color) => {
    if (type === 'folder') return <FiFolder color={color} />;
    if (type === 'dashboard') return <FiLayout color={color} />;
    return <FiGrid color={color} />;
  };

  const filteredBoards = boards.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="sidebar">
      <div className="sidebar-header" style={{ position: 'relative' }}>
        {isSearching ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }} ref={searchInputRef}>
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
          <>
            Workspace
            <button onClick={() => setIsSearching(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <FiSearch size={14}/>
            </button>
          </>
        )}
      </div>
      
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }} ref={menuRef}>
        <button 
          className="btn-outline" 
          style={{ width: '100%', marginBottom: 0, justifyContent: 'center' }}
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          <FiPlus /> Add
        </button>
        
        {showAddMenu && (
          <div className="add-menu-dropdown">
            <div className="add-menu-item" onClick={() => handleAdd('grid')}>
              <FiGrid color="var(--accent-blue)" /> New Board
            </div>
            <div className="add-menu-item" onClick={() => handleAdd('dashboard')}>
              <FiLayout color="var(--group-color-3)" /> New Dashboard
            </div>
            <div className="add-menu-item" onClick={() => handleAdd('folder')}>
              <FiFolder color="var(--accent-purple)" /> New Folder
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-content">
        {filteredBoards.map(board => (
          <div 
            key={board.id} 
            className={`sidebar-menu-item ${board.id === activeBoardId ? 'active' : ''}`}
            onClick={() => onSelectBoard(board.id)}
            onMouseEnter={() => setHoveredId(board.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {renderIcon(board.type, board.color || 'var(--accent-blue)')}
              {board.title}
            </div>
            
            {hoveredId === board.id && (
              <div className="sidebar-item-actions" onClick={(e) => handleDelete(board.id, e)} title="Delete">
                <FiMoreHorizontal size={16} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
