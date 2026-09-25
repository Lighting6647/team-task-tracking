import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import TableView from './components/TableView';
import DashboardView from './components/DashboardView';
import KanbanView from './components/KanbanView';
import DocumentView from './components/DocumentView';
import GanttView from './components/GanttView';
import FormView from './components/FormView';
import TaskDrawer from './components/TaskDrawer';
import TopActions from './components/TopActions';
import './index.css';

const INITIAL_STATUS_OPTIONS = [
  { id: 'empty', label: '', color: '#c4c4c4' },
  { id: 'working', label: 'Working on it', color: '#fdab3d' },
  { id: 'done', label: 'Done', color: '#00c875' },
  { id: 'stuck', label: 'Stuck', color: '#e2445c' }
];

const DEFAULT_COLUMNS = [
  { id: 'status', title: 'Status', type: 'status', width: 140, options: INITIAL_STATUS_OPTIONS },
  { id: 'person', title: 'Person', type: 'person', width: 120 },
  { id: 'date', title: 'Date', type: 'date', width: 150 },
  { id: 'link', title: 'Link', type: 'link', width: 250 }
];

const INITIAL_BOARDS = [
  {
    id: 'board-1',
    title: 'MKT ALL 2024 🏳️‍🌈',
    type: 'grid',
    color: 'var(--accent-blue)',
    columns: DEFAULT_COLUMNS,
    groups: [
      {
        id: 'group-1',
        title: 'New Group',
        color: 'var(--group-color-1)',
        items: []
      }
    ]
  }
];

const GROUP_COLORS = [
  'var(--group-color-1)',
  'var(--group-color-2)',
  'var(--group-color-3)',
  'var(--group-color-4)',
  'var(--accent-blue)',
  'var(--accent-purple)'
];


const App = () => {
  const [boards, setBoards] = useState(() => {
    const saved = localStorage.getItem('monday_boards_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(b => {
          if (b.type === 'grid') {
            const cols = b.columns || DEFAULT_COLUMNS;
            // Migrate status columns to have options
            const migratedCols = cols.map(c => 
              c.type === 'status' && !c.options ? { ...c, options: INITIAL_STATUS_OPTIONS } : c
            );
            return { ...b, columns: migratedCols };
          }
          if (b.type === 'dashboard' && !b.widgets) {
            return { ...b, widgets: [] };
          }
          return b;
        });
      } catch (e) {
        return INITIAL_BOARDS;
      }
    }
    return INITIAL_BOARDS;
  });

  const [activeBoardId, setActiveBoardId] = useState(boards[0]?.id || null);

  useEffect(() => {
    localStorage.setItem('monday_boards_v1', JSON.stringify(boards));
    if (boards.length > 0 && !boards.find(b => b.id === activeBoardId)) {
      setActiveBoardId(boards[0].id);
    }
  }, [boards, activeBoardId]);

  useEffect(() => {
    setActiveItemContext(null);
  }, [activeBoardId]);

  // Automations
  useEffect(() => {
    let hasChanges = false;
    const automatedBoards = boards.map(board => {
      if (board.type !== 'grid') return board;
      let boardChanged = false;
      
      const dateCol = (board.columns || []).find(c => c.type === 'timeline');
      const statusCol = (board.columns || []).find(c => c.type === 'status');
      
      if (!dateCol || !statusCol) return board;

      let newOptions = statusCol.options || [];
      if (!newOptions.find(o => o.id === 'overdue')) {
        newOptions = [...newOptions, { id: 'overdue', label: 'Overdue', color: '#5e5e5e' }];
        boardChanged = true;
      }

      const today = new Date();
      today.setHours(0,0,0,0);

      const newGroups = board.groups.map(g => {
        let groupChanged = false;
        const newItems = g.items.map(item => {
          const dateVal = item[dateCol.id];
          if (!dateVal) return item;
          
          const endDateStr = dateVal.end;
          if (!endDateStr) return item;

          const endDate = new Date(endDateStr);
          endDate.setHours(0,0,0,0);
          const currentStatus = item[statusCol.id];

          // Only change to overdue if it is not 'done' and not already 'overdue'
          if (endDate < today && currentStatus !== 'done' && currentStatus !== 'overdue') {
            groupChanged = true;
            return { ...item, [statusCol.id]: 'overdue' };
          }
          return item;
        });

        if (groupChanged) boardChanged = true;
        return groupChanged ? { ...g, items: newItems } : g;
      });

      if (boardChanged) {
        hasChanges = true;
        const newCols = board.columns.map(c => c.id === statusCol.id ? { ...c, options: newOptions } : c);
        return { ...board, columns: newCols, groups: newGroups };
      }
      return board;
    });

    if (hasChanges) {
      setBoards(automatedBoards);
    }
  }, [boards]);


  // View States for Top Actions
  const [viewType, setViewType] = useState('table'); // 'table' or 'kanban'
  const [activeItemContext, setActiveItemContext] = useState(null); // { groupId, itemId }
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState(null);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [groupBy, setGroupBy] = useState('default');

  const activeBoard = boards.find(b => b.id === activeBoardId);

  // Data Transformation
  const getProcessedGroups = () => {
    if (!activeBoard || activeBoard.type !== 'grid') return [];
    
    let processedGroups = JSON.parse(JSON.stringify(activeBoard.groups));

    // 1. Filter by Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      processedGroups = processedGroups.map(g => ({
        ...g,
        items: g.items.filter(item => item.title.toLowerCase().includes(lowerQuery))
      }));
    }

    // 2. Filter by Status
    if (statusFilter !== '') {
      processedGroups = processedGroups.map(g => ({
        ...g,
        items: g.items.filter(item => item.status === statusFilter)
      }));
    }

    // 3. Sort Items within groups
    if (sortConfig) {
      processedGroups = processedGroups.map(g => ({
        ...g,
        items: g.items.sort((a, b) => {
          // Handle dates and specific objects
          const valA = a[sortConfig.key];
          const valB = b[sortConfig.key];

          // Safely extract string/number for comparison
          const normalize = (v) => {
            if (v === undefined || v === null) return '';
            if (typeof v === 'boolean') return v ? 1 : 0;
            if (typeof v === 'object') {
              if (v.start) return new Date(v.start).getTime(); // Timeline
              return '';
            }
            return v;
          };

          const nA = normalize(valA);
          const nB = normalize(valB);

          if (sortConfig.key === 'title') {
            return sortConfig.direction === 'asc' ? String(nA).localeCompare(String(nB)) : String(nB).localeCompare(String(nA));
          } 

          if (typeof nA === 'number' || typeof nB === 'number' || (!isNaN(nA) && !isNaN(nB) && nA !== '' && nB !== '')) {
            const numA = Number(nA) || 0;
            const numB = Number(nB) || 0;
            return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
          }

          const strA = String(nA).toLowerCase();
          const strB = String(nB).toLowerCase();
          return sortConfig.direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        })
      }));
    }

    // 4. Group By Status
    if (groupBy === 'status') {
      const allItems = processedGroups.flatMap(g => g.items);
      const statusCol = activeBoard.columns?.find(c => c.id === 'status');
      const currentStatusOptions = statusCol ? statusCol.options : INITIAL_STATUS_OPTIONS;
      const statusGroupsMap = {};
      
      currentStatusOptions.forEach(opt => {
        statusGroupsMap[opt.id] = {
          id: `virtual-group-${opt.id}`,
          title: opt.label || 'Empty Status',
          color: opt.color,
          items: [],
          isVirtual: true // Mark as virtual so we can disable rename/delete
        };
      });

      allItems.forEach(item => {
        const sId = item.status || 'empty';
        if (statusGroupsMap[sId]) {
          statusGroupsMap[sId].items.push(item);
        }
      });

      // Only return groups that actually have items to keep it clean, plus empty one if all are empty?
      // Actually, Monday shows all groups if you group by status, but filtering out empty ones is cleaner
      processedGroups = Object.values(statusGroupsMap).filter(g => g.items.length > 0);
    }

    return processedGroups;
  };

  const processedGroups = getProcessedGroups();

  // Board Actions
  const handleAddBoard = (type = 'grid', parentId = null) => {
    const newBoard = {
      id: uuidv4(),
      title: type === 'grid' ? 'New Board' : type === 'dashboard' ? 'New Dashboard' : type === 'doc' ? 'New Document' : 'New Folder',
      type: type,
      parentId: parentId,
      color: type === 'grid' ? 'var(--accent-blue)' : type === 'doc' ? 'var(--accent-purple)' : 'var(--text-muted)',
      columns: type === 'grid' ? DEFAULT_COLUMNS : undefined,
      widgets: type === 'dashboard' ? [] : undefined,
      content: type === 'doc' ? '' : undefined,
      groups: type === 'grid' ? [
        {
          id: uuidv4(),
          title: 'New Group',
          color: GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)],
          items: []
        }
      ] : []
    };
    setBoards([...boards, newBoard]);
    setActiveBoardId(newBoard.id);
  };

  const handleUpdateDashboard = (boardId, widgets) => {
    setBoards(boards.map(b => b.id === boardId ? { ...b, widgets } : b));
  };

  const handleUpdateDocument = (boardId, content) => {
    setBoards(boards.map(b => b.id === boardId ? { ...b, content } : b));
  };

  const handleAddColumn = (boardId, columnType, columnTitle) => {
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      
      const newColId = `${columnType}_${uuidv4().substring(0,6)}`;
      const newColumn = {
        id: newColId,
        title: columnTitle,
        type: columnType,
        width: columnType === 'text' ? 250 : columnType === 'timeline' ? 220 : 150,
        options: columnType === 'status' ? INITIAL_STATUS_OPTIONS : undefined
      };

      return {
        ...b,
        columns: [...(b.columns || DEFAULT_COLUMNS), newColumn]
      };
    }));
  };

  const handleRenameColumn = (boardId, colId, newTitle) => {
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: (b.columns || DEFAULT_COLUMNS).map(c => 
          c.id === colId ? { ...c, title: newTitle } : c
        )
      };
    }));
  };

  const handleUpdateColumnWidth = (boardId, colId, newWidth) => {
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: (b.columns || DEFAULT_COLUMNS).map(c => 
          c.id === colId ? { ...c, width: newWidth } : c
        )
      };
    }));
  };

  const handleReorderColumns = (boardId, sourceId, targetId) => {
    if (sourceId === targetId) return;
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      const cols = [...(b.columns || DEFAULT_COLUMNS)];
      const sourceIndex = cols.findIndex(c => c.id === sourceId);
      const targetIndex = cols.findIndex(c => c.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return b;

      const [movedCol] = cols.splice(sourceIndex, 1);
      cols.splice(targetIndex, 0, movedCol);

      return { ...b, columns: cols };
    }));
  };

  const handleUpdateColumnOptions = (boardId, colId, newOptions) => {
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: (b.columns || DEFAULT_COLUMNS).map(c => 
          c.id === colId ? { ...c, options: newOptions } : c
        )
      };
    }));
  };

  const handleDeleteColumn = (boardId, colId) => {
    setBoards(boards.map(b => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: (b.columns || DEFAULT_COLUMNS).filter(c => c.id !== colId)
      };
    }));
  };

  const handleDeleteBoard = (boardId) => {
    setBoards(boards.filter(b => b.id !== boardId));
  };

  const handleUpdateBoardTitle = (title) => {
    if (!activeBoard) return;
    setBoards(boards.map(b => b.id === activeBoardId ? { ...b, title } : b));
  };

  const handleRenameBoard = (boardId, newTitle) => {
    setBoards(boards.map(b => b.id === boardId ? { ...b, title: newTitle } : b));
  };

  const handleMoveBoard = (boardId, targetParentId) => {
    setBoards(boards.map(b => b.id === boardId ? { ...b, parentId: targetParentId } : b));
  };

  // Group Actions (scoped to active board)
  const handleReorderItem = (sourceGroupId, sourceItemId, targetGroupId, targetItemId) => {
    if (!activeBoard) return;
    if (sourceGroupId === targetGroupId && sourceItemId === targetItemId) return;

    const newGroups = JSON.parse(JSON.stringify(activeBoard.groups));
    const sourceGroup = newGroups.find(g => g.id === sourceGroupId);
    const targetGroup = newGroups.find(g => g.id === targetGroupId);
    if (!sourceGroup || !targetGroup) return;
    const sourceItemIndex = sourceGroup.items.findIndex(i => i.id === sourceItemId);
    if (sourceItemIndex === -1) return;
    const [movedItem] = sourceGroup.items.splice(sourceItemIndex, 1);
    if (targetItemId) {
      const targetItemIndex = targetGroup.items.findIndex(i => i.id === targetItemId);
      targetGroup.items.splice(targetItemIndex, 0, movedItem);
    } else {
      targetGroup.items.push(movedItem);
    }
    updateActiveBoardGroups(newGroups);
  };

  const updateActiveBoardGroups = (newGroups) => {
    setBoards(boards.map(b => b.id === activeBoardId ? { ...b, groups: newGroups } : b));
  };

  const getActiveTask = () => {
    if (!activeItemContext || !activeBoard || activeBoard.type !== 'grid') return null;
    const group = activeBoard.groups.find(g => g.id === activeItemContext.groupId);
    if (!group) return null;
    return group.items.find(i => i.id === activeItemContext.itemId);
  };

  const handleUpdateActiveTaskContext = (field, value) => {
    if (activeItemContext) {
      handleUpdateItem(activeItemContext.groupId, activeItemContext.itemId, field, value);
    }
  };

  const handleUpdateItem = (groupId, itemId, field, value, parentId = null) => {
    if (!activeBoard) return;
    const newGroups = activeBoard.groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: g.items.map(item => {
            if (parentId) {
              if (item.id === parentId) {
                return {
                  ...item,
                  subitems: (item.subitems || []).map(sub => 
                    sub.id === itemId ? { ...sub, [field]: value } : sub
                  )
                };
              }
              return item;
            } else {
              return item.id === itemId ? { ...item, [field]: value } : item;
            }
          })
        };
      }
      return g;
    });
    updateActiveBoardGroups(newGroups);
  };

  const handleAddItem = (groupId, title) => {
    if (!activeBoard) return null;
    const newItemId = uuidv4();
    const newGroups = activeBoard.groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: [...g.items, { id: newItemId, title }]
        };
      }
      return g;
    });
    updateActiveBoardGroups(newGroups);
    return newItemId;
  };

  const handleAddSubitem = (groupId, parentId, title) => {
    if (!activeBoard) return;
    const newGroups = activeBoard.groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: g.items.map(item => {
            if (item.id === parentId) {
              return {
                ...item,
                subitems: [...(item.subitems || []), { id: uuidv4(), title }]
              };
            }
            return item;
          })
        };
      }
      return g;
    });
    updateActiveBoardGroups(newGroups);
  };

  const handleDeleteItem = (groupId, itemId, parentId = null) => {
    if (!activeBoard) return;
    const newGroups = activeBoard.groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          items: parentId 
            ? g.items.map(item => item.id === parentId 
                ? { ...item, subitems: (item.subitems || []).filter(sub => sub.id !== itemId) } 
                : item)
            : g.items.filter(item => item.id !== itemId)
        };
      }
      return g;
    });
    updateActiveBoardGroups(newGroups);
  };

  const handleAddGroup = () => {
    if (!activeBoard) return;
    const newGroup = {
      id: uuidv4(),
      title: 'New Group',
      color: GROUP_COLORS[activeBoard.groups.length % GROUP_COLORS.length],
      items: []
    };
    updateActiveBoardGroups([...activeBoard.groups, newGroup]);
  };

  const handleDeleteGroup = (groupId) => {
    if (!activeBoard) return;
    if (window.confirm('Are you sure you want to delete this group and all its items?')) {
      const newGroups = activeBoard.groups.filter(g => g.id !== groupId);
      updateActiveBoardGroups(newGroups);
    }
  };

  const handleRenameGroup = (groupId, newTitle) => {
    if (!activeBoard) return;
    const newGroups = activeBoard.groups.map(g => 
      g.id === groupId ? { ...g, title: newTitle } : g
    );
    updateActiveBoardGroups(newGroups);
  };

  return (
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
