import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add missing icons for global nav and toolbar
import_match = re.search(r"import {([^}]+)} from 'react-icons/fi';", code)
if import_match:
    icons = import_match.group(1)
    new_icons = icons + ", FiBell, FiInbox, FiUserPlus, FiMoreHorizontal, FiSearch, FiFilter, FiArrowDown, FiEyeOff, FiUsers, FiGrid, FiHelpCircle, FiSettings, FiMenu"
    code = code.replace(import_match.group(0), f"import {{{new_icons}}} from 'react-icons/fi';")

new_return = """  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Global Navbar */}
      <div className="top-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="global-nav-icon"><FiMenu size={20} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <div style={{ width: '24px', height: '24px', backgroundColor: 'var(--accent-blue)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '12px', height: '12px', border: '2px solid white', borderRadius: '50%' }}></div>
            </div>
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>monday work management</span>
          </div>
          <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', borderColor: 'rgba(255,255,255,0.2)' }}>See plans</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="global-nav-icon"><FiBell size={18} /></div>
          <div className="global-nav-icon"><FiInbox size={18} /></div>
          <div className="global-nav-icon"><FiUserPlus size={18} /></div>
          <div className="global-nav-icon"><FiSearch size={18} /></div>
          <div className="global-nav-icon"><FiHelpCircle size={18} /></div>
          <div className="global-nav-icon"><FiGrid size={18} /></div>
          <div className="avatar" style={{ width: '28px', height: '28px', marginLeft: '0.5rem', cursor: 'pointer' }}>A</div>
        </div>
      </div>

      <div className="app-container" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar 
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={setActiveBoardId}
          onAddBoard={handleAddBoard}
          onDeleteBoard={handleDeleteBoard}
          onRenameBoard={handleRenameBoard}
          onMoveBoard={handleMoveBoard}
        />
        
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', borderTopLeftRadius: '8px', borderLeft: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', overflow: 'hidden' }}>
          {activeBoard ? (
            <>
              {/* Board Header */}
              <div className="board-header">
                <div className="board-title-row">
                  <div className="board-title">
                    <input 
                      type="text" 
                      value={activeBoard.title}
                      onChange={(e) => handleUpdateBoardTitle(e.target.value)}
                      className="inline-input"
                      style={{ fontSize: '1.75rem', fontWeight: 600, width: '300px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}><FiSettings /> Integrate</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}><FiSettings /> Automate</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}><FiUserPlus /> Invite / 1</div>
                  </div>
                </div>
                
                {/* Board Tabs */}
                {activeBoard.type === 'grid' && (
                  <div className="board-tabs">
                    <div className={`board-tab ${viewType === 'table' ? 'active' : ''}`} onClick={() => setViewType('table')}>Main table</div>
                    <div className={`board-tab ${viewType === 'kanban' ? 'active' : ''}`} onClick={() => setViewType('kanban')}>Kanban</div>
                    <div className={`board-tab ${viewType === 'gantt' ? 'active' : ''}`} onClick={() => setViewType('gantt')}>Timeline</div>
                    <div className={`board-tab ${viewType === 'form' ? 'active' : ''}`} onClick={() => setViewType('form')}>Form</div>
                  </div>
                )}
              </div>

              {/* Board Toolbar */}
              {activeBoard.type === 'grid' && (
                <div className="board-toolbar">
                  <button className="btn-primary" onClick={() => {
                    const firstGroup = activeBoard.groups[0];
                    if (firstGroup) handleAddItem(firstGroup.id, 'New Item');
                  }}>
                    New Item <FiArrowDown style={{ marginLeft: '4px' }} />
                  </button>
                  <button className="toolbar-btn"><FiSearch /> Search</button>
                  <button className="toolbar-btn"><FiUsers /> Person</button>
                  <button className="toolbar-btn"><FiFilter /> Filter</button>
                  <button className="toolbar-btn"><FiArrowDown /> Sort</button>
                  <button className="toolbar-btn"><FiEyeOff /> Hide</button>
                  <button className="toolbar-btn"><FiGrid /> Group by</button>
                  <button className="toolbar-btn"><FiMoreHorizontal /></button>
                </div>
              )}

              {/* View Content */}
              <div className="board-container" style={{ padding: '0 2rem 2rem 2rem' }}>
                {activeBoard.type === 'grid' && viewType === 'table' && (
                  <TableView 
                    board={activeBoard} 
                    onUpdateBoard={handleUpdateBoardGroups}
                    onUpdateColumns={handleUpdateColumns}
                    onAddItem={handleAddItem}
                    onReorderItem={handleReorderItem}
                    onRenameGroup={handleRenameGroup}
                    onDeleteGroup={handleDeleteGroup}
                  />
                )}
                {activeBoard.type === 'grid' && viewType === 'kanban' && <KanbanView board={activeBoard} onUpdateBoard={handleUpdateBoardGroups} />}
                {activeBoard.type === 'grid' && viewType === 'gantt' && <GanttView board={activeBoard} />}
                {activeBoard.type === 'grid' && viewType === 'form' && <FormView board={activeBoard} onSubmit={handleFormSubmit} />}
                {activeBoard.type === 'doc' && <DocumentView board={activeBoard} onClose={() => {
                  const firstGrid = boards.find(b => b.type === 'grid');
                  if (firstGrid) setActiveBoardId(firstGrid.id);
                }} />}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select a board to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
"""

# Replace the return block
code = re.sub(r'  return \(\n    <div className="app-container">.*', new_return, code, flags=re.DOTALL)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
