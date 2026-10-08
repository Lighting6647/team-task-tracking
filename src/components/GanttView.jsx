import React, { useState, useMemo } from 'react';
import { FiChevronRight, FiChevronDown, FiCalendar } from 'react-icons/fi';

const GanttView = ({ board, groups: propGroups, columns: propColumns, onOpenItem }) => {
  const [zoom, setZoom] = useState('weeks'); // 'days', 'weeks', 'months'
  const [expandedGroups, setExpandedGroups] = useState({});

  const groups = useMemo(() => propGroups || board?.groups || [], [propGroups, board?.groups]);
  const columns = useMemo(() => propColumns || board?.columns || [], [propColumns, board?.columns]);

  // Find timeline or date columns
  const dateColumns = columns.filter(c => c.type === 'timeline' || c.type === 'date');
  const mainDateCol = dateColumns[0];

  // Calculate timeline range
  const { minDate, maxDate } = useMemo(() => {
    let min = new Date('2099-01-01').getTime();
    let max = new Date('1970-01-01').getTime();
    let hasDates = false;

    groups.forEach(group => {
      (group.items || []).forEach(item => {
        let start, end;
        if (mainDateCol) {
          if (mainDateCol.type === 'timeline' && item[mainDateCol.id]) {
            start = new Date(item[mainDateCol.id].start).getTime();
            end = new Date(item[mainDateCol.id].end).getTime();
          } else if (mainDateCol.type === 'date' && item[mainDateCol.id]) {
            start = new Date(item[mainDateCol.id]).getTime();
            end = start;
          }
        }
        
        if (start && !isNaN(start)) {
          min = Math.min(min, start);
          max = Math.max(max, end || start);
          hasDates = true;
        }
      });
    });

    if (!hasDates) {
      const now = Date.now();
      min = now - 7 * 86400000;
      max = now + 14 * 86400000;
    } else {
      min -= 7 * 86400000; // pad 1 week
      max += 14 * 86400000; // pad 2 weeks
    }

    return { minDate: min, maxDate: max };
  }, [groups, mainDateCol]);

  const days = Math.ceil((maxDate - minDate) / 86400000);
  const dayWidth = zoom === 'days' ? 40 : zoom === 'weeks' ? 10 : 3;

  const getLeft = (timestamp) => {
    return Math.max(0, (timestamp - minDate) / 86400000) * dayWidth;
  };

  const getWidth = (start, end) => {
    return Math.max(1, (end - start) / 86400000) * dayWidth;
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: prev[groupId] !== undefined ? !prev[groupId] : false
    }));
  };

  if (!mainDateCol) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <FiCalendar size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Date or Timeline Column</h3>
        <p>Please add a Timeline or Date column to the table view first.</p>
      </div>
    );
  }

  return (
    <div className="gantt-container">
      <div className="gantt-controls">
        <button className={`btn-outline ${zoom === 'days' ? 'active' : ''}`} onClick={() => setZoom('days')} style={{ background: zoom === 'days' ? 'rgba(0,133,255,0.2)' : 'transparent', color: zoom === 'days' ? '#fff' : 'var(--text-muted)' }}>Days</button>
        <button className={`btn-outline ${zoom === 'weeks' ? 'active' : ''}`} onClick={() => setZoom('weeks')} style={{ background: zoom === 'weeks' ? 'rgba(0,133,255,0.2)' : 'transparent', color: zoom === 'weeks' ? '#fff' : 'var(--text-muted)' }}>Weeks</button>
        <button className={`btn-outline ${zoom === 'months' ? 'active' : ''}`} onClick={() => setZoom('months')} style={{ background: zoom === 'months' ? 'rgba(0,133,255,0.2)' : 'transparent', color: zoom === 'months' ? '#fff' : 'var(--text-muted)' }}>Months</button>
      </div>
      
      <div className="gantt-main-area">
        {/* Left side: Item list */}
        <div className="gantt-items-sidebar">
          <div style={{ height: '50px', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 1rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center' }}>
            Items
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {groups.map(group => (
              <React.Fragment key={group.id}>
                <div 
                  onClick={() => toggleGroup(group.id)}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    color: group.color,
                    fontWeight: 'bold',
                    background: 'rgba(255,255,255,0.02)'
                  }}
                >
                  {expandedGroups[group.id] !== false ? <FiChevronDown style={{marginRight:'8px'}}/> : <FiChevronRight style={{marginRight:'8px'}}/>}
                  {group.title}
                </div>
                {expandedGroups[group.id] !== false && (group.items || []).map(item => (
                  <div 
                    key={item.id} 
                    style={{ 
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      color: 'var(--text-main)',
                      fontSize: '0.9rem'
                    }}
                    onClick={() => onOpenItem && onOpenItem(group.id, item.id)}
                  >
                    {item.title}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right side: Timeline */}
        <div style={{ flex: 1, overflowX: 'auto', position: 'relative' }}>
          <div style={{ height: '50px', borderBottom: '1px solid var(--glass-border)', display: 'flex', minWidth: `${days * dayWidth}px`, background: 'rgba(0,0,0,0.1)' }}>
             {/* Simple timeline header */}
             {Array.from({ length: Math.ceil(days / 7) }).map((_, i) => {
               const date = new Date(minDate + i * 7 * 86400000);
               return (
                 <div key={i} style={{ width: `${dayWidth * 7}px`, padding: '1rem 0.5rem', fontSize: '0.8rem', borderRight: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, color: 'var(--text-muted)' }}>
                   {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                 </div>
               );
             })}
          </div>
          <div style={{ minWidth: `${days * dayWidth}px`, position: 'relative', padding: '0.5rem 0' }}>
            {/* Grid lines */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', pointerEvents: 'none' }}>
               {Array.from({ length: Math.ceil(days / 7) }).map((_, i) => (
                 <div key={i} style={{ width: `${dayWidth * 7}px`, borderRight: '1px solid rgba(255,255,255,0.05)', height: '100%', flexShrink: 0 }}></div>
               ))}
            </div>

            {groups.map(group => (
              <React.Fragment key={group.id}>
                <div style={{ height: '45px' }}></div>
                {expandedGroups[group.id] !== false && (group.items || []).map(item => {
                  let start, end;
                  if (mainDateCol.type === 'timeline' && item[mainDateCol.id]) {
                    start = new Date(item[mainDateCol.id].start).getTime();
                    end = new Date(item[mainDateCol.id].end).getTime();
                  } else if (mainDateCol.type === 'date' && item[mainDateCol.id]) {
                    start = new Date(item[mainDateCol.id]).getTime();
                    end = start;
                  }

                  if (!start || isNaN(start)) {
                    return <div key={item.id} style={{ height: '45px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}></div>;
                  }

                  const left = getLeft(start);
                  const width = getWidth(start, end || start);

                  return (
                    <div key={item.id} style={{ height: '45px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                      <div 
                        style={{ 
                          position: 'absolute', 
                          left: `${left}px`, 
                          width: `${Math.max(width, dayWidth)}px`, 
                          top: '10px', 
                          height: '24px', 
                          background: group.color,
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scaleY(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scaleY(1)'}
                        onClick={() => onOpenItem && onOpenItem(group.id, item.id)}
                        title={item.title}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttView;
