import re

with open('src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add missing icons
import_match = re.search(r"import {([^}]+)} from 'react-icons/fi';", code)
if import_match:
    icons = import_match.group(1)
    new_icons = icons + ", FiHome, FiCheckSquare, FiVideo, FiStar"
    code = code.replace(import_match.group(0), f"import {{{new_icons}}} from 'react-icons/fi';")

# Sidebar structure changes
new_return = """  return (
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
"""
code = re.sub(r'  return \(\n    <div className="sidebar">.*', new_return, code, flags=re.DOTALL)

with open('src/components/Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
