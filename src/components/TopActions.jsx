import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiFilter, FiList, FiEyeOff, FiLayers, FiX } from 'react-icons/fi';

const TopActions = ({ 
  searchQuery, setSearchQuery, 
  statusFilter, setStatusFilter, statusOptions,
  sortConfig, setSortConfig,
  hiddenColumns, setHiddenColumns,
  groupBy, setGroupBy,
  columns = []
}) => {
  const [activePopover, setActivePopover] = useState(null); // 'search', 'filter', 'sort', 'hide', 'group'
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePopover = (name) => {
    setActivePopover(activePopover === name ? null : name);
  };

  const toggleHiddenColumn = (colName) => {
    if (hiddenColumns.includes(colName)) {
      setHiddenColumns(hiddenColumns.filter(c => c !== colName));
    } else {
      setHiddenColumns([...hiddenColumns, colName]);
    }
  };

  return (
    <div className="top-actions" style={{ position: 'relative' }} ref={popoverRef}>
      
      {activePopover === 'search' ? (
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-panel)', padding: '0 0.5rem', borderRadius: '4px', border: '1px solid var(--accent-blue)' }}>
          <FiSearch size={14} color="var(--text-muted)" />
          <input 
            autoFocus
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.4rem 0.5rem', outline: 'none' }}
          />
          <button className="icon-btn" onClick={() => { setSearchQuery(''); togglePopover(null); }}><FiX size={14}/></button>
        </div>
      ) : (
        <button onClick={() => togglePopover('search')} className={searchQuery ? 'active-filter-btn' : ''}>
          <FiSearch style={{marginRight: '4px'}}/> Search
        </button>
      )}
      
      <button>Person</button>

      <div style={{ position: 'relative' }}>
        <button onClick={() => togglePopover('filter')} className={statusFilter ? 'active-filter-btn' : ''}>
          <FiFilter style={{marginRight: '4px'}}/> Filter
        </button>
        {activePopover === 'filter' && (
          <div className="action-popover">
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Filter by Status</div>
            <div className="popover-option" onClick={() => setStatusFilter('')}>
              {statusFilter === '' ? '✓ ' : ''} All
            </div>
            {statusOptions.map(opt => (
              <div key={opt.id} className="popover-option" onClick={() => setStatusFilter(opt.id)}>
                {statusFilter === opt.id ? '✓ ' : ''} 
                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: opt.color, marginRight: '8px' }}></span>
                {opt.label || 'Empty'}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button onClick={() => togglePopover('sort')} className={sortConfig ? 'active-filter-btn' : ''}>
          <FiList style={{marginRight: '4px'}}/> Sort
        </button>
        {activePopover === 'sort' && (
          <div className="action-popover">
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Sort Items</div>
            <div className="popover-option" onClick={() => setSortConfig(null)}>
              {sortConfig === null ? '✓ ' : ''} Default (Manual)
            </div>
            <div className="popover-option" onClick={() => setSortConfig({ key: 'title', direction: 'asc' })}>
              {sortConfig?.key === 'title' && sortConfig.direction === 'asc' ? '✓ ' : ''} Item (A-Z)
            </div>
            <div className="popover-option" onClick={() => setSortConfig({ key: 'title', direction: 'desc' })}>
              {sortConfig?.key === 'title' && sortConfig.direction === 'desc' ? '✓ ' : ''} Item (Z-A)
            </div>
            {columns.map(col => (
              <div key={`sort-${col.id}`} className="popover-option" onClick={() => setSortConfig({ key: col.id, direction: 'asc' })}>
                {sortConfig?.key === col.id ? '✓ ' : ''} {col.title}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button onClick={() => togglePopover('hide')} className={hiddenColumns.length > 0 ? 'active-filter-btn' : ''}>
          <FiEyeOff style={{marginRight: '4px'}}/> Hide
        </button>
        {activePopover === 'hide' && (
          <div className="action-popover">
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Hide Columns</div>
            {columns.map(col => (
              <div key={`hide-${col.id}`} className="popover-option" onClick={() => toggleHiddenColumn(col.id)}>
                <input type="checkbox" checked={!hiddenColumns.includes(col.id)} readOnly style={{marginRight: '8px'}} />
                {col.title}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button onClick={() => togglePopover('group')} className={groupBy !== 'default' ? 'active-filter-btn' : ''}>
          <FiLayers style={{marginRight: '4px'}}/> Group by
        </button>
        {activePopover === 'group' && (
          <div className="action-popover">
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Group Items By</div>
            <div className="popover-option" onClick={() => setGroupBy('default')}>
              {groupBy === 'default' ? '✓ ' : ''} Default Groups
            </div>
            <div className="popover-option" onClick={() => setGroupBy('status')}>
              {groupBy === 'status' ? '✓ ' : ''} Status
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopActions;
