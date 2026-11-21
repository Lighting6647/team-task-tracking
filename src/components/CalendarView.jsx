import React, { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiPlus } from 'react-icons/fi';

const WEEKDAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

function extractDateString(val) {
  if (!val) return '';
  if (typeof val === 'string') return val.slice(0, 10);
  if (typeof val === 'object') return (val.end || val.start || '').slice(0, 10);
  return '';
}

function toIsoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const CalendarView = ({ board, updateItem, addItem, onOpenItem, readOnly = false }) => {
  const dateCol = useMemo(
    () => (board?.columns || []).find((c) => c.type === 'date' || c.type === 'timeline') || { id: 'date' },
    [board]
  );
  const statusCol = useMemo(
    () => (board?.columns || []).find((c) => c.type === 'status'),
    [board]
  );

  // Pick initial month from first dated item or today
  const initialDate = useMemo(() => {
    for (const g of board?.groups || []) {
      for (const it of g.items || []) {
        const ds = extractDateString(it[dateCol.id]);
        if (ds && /^\d{4}-\d{2}-\d{2}$/.test(ds)) {
          const [y, m] = ds.split('-').map(Number);
          return new Date(y, m - 1, 1);
        }
      }
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [board, dateCol.id]);

  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverIso, setDragOverIso] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const itemsByDate = useMemo(() => {
    const map = {};
    for (const g of board?.groups || []) {
      for (const item of g.items || []) {
        const iso = extractDateString(item[dateCol.id]);
        if (!iso) continue;
        if (!map[iso]) map[iso] = [];
        const statusOpt = statusCol?.options?.find((o) => o.id === item[statusCol.id]);
        map[iso].push({
          groupId: g.id,
          groupColor: g.color,
          item,
          color: statusOpt?.color || g.color || '#0073ea',
          statusLabel: statusOpt?.label || '',
        });
      }
    }
    return map;
  }, [board, dateCol.id, statusCol]);

  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ empty: true, key: `empty-start-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        empty: false,
        day: d,
        iso: toIsoDate(year, month, d),
        key: toIsoDate(year, month, d),
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ empty: true, key: `empty-end-${cells.length}` });
    }
    return cells;
  }, [year, month]);

  const todayIso = new Date().toISOString().slice(0, 10);

  const handleDropOnDay = (e, iso) => {
    e.preventDefault();
    setDragOverIso(null);
    if (readOnly || !draggedCard || !updateItem) return;
    const { groupId, itemId } = draggedCard;
    updateItem(groupId, itemId, dateCol.id, iso);
    setDraggedCard(null);
  };

  const handleQuickAddDay = (iso) => {
    if (readOnly || !addItem || !board?.groups?.length) return;
    const title = window.prompt(`เพิ่มงานใหม่สำหรับวันที่ ${iso}:`);
    if (title && title.trim()) {
      addItem(board.groups[0].id, title.trim(), { [dateCol.id]: iso });
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem 1.25rem', overflowY: 'auto', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Calendar Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FiCalendar size={18} color="#0073ea" />
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
            {MONTHS_TH[month]} {year + 543}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            aria-label="Previous month"
            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px' }}
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              const now = new Date();
              setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem' }}
          >
            วันนี้ (Today)
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            aria-label="Next month"
            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px' }}
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px', marginBottom: '6px' }}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.35rem 0' }}>
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px', flex: 1 }}>
        {calendarCells.map((cell) => {
          if (cell.empty) {
            return (
              <div
                key={cell.key}
                style={{ minHeight: '104px', borderRadius: '8px', backgroundColor: 'rgba(148,163,184,0.04)', border: '1px dashed rgba(148,163,184,0.12)' }}
              />
            );
          }
          const dayItems = itemsByDate[cell.iso] || [];
          const isToday = cell.iso === todayIso;
          const isDropTarget = dragOverIso === cell.iso;

          return (
            <div
              key={cell.key}
              onDragOver={(e) => {
                if (readOnly) return;
                e.preventDefault();
                setDragOverIso(cell.iso);
              }}
              onDragLeave={() => setDragOverIso(null)}
              onDrop={(e) => handleDropOnDay(e, cell.iso)}
              style={{
                minHeight: '104px',
                borderRadius: '8px',
                padding: '0.45rem',
                backgroundColor: isDropTarget ? 'rgba(0, 115, 234, 0.14)' : 'var(--bg-secondary)',
                border: isToday ? '1.5px solid #0073ea' : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isToday ? 800 : 600,
                    color: isToday ? '#0073ea' : 'var(--text-muted)',
                  }}
                >
                  {cell.day}
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleQuickAddDay(cell.iso)}
                    title={`เพิ่มงานวันที่ ${cell.iso}`}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '1px' }}
                  >
                    <FiPlus size={12} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
                {dayItems.map((entry) => (
                  <div
                    key={entry.item.id}
                    draggable={!readOnly}
                    onDragStart={() => setDraggedCard({ groupId: entry.groupId, itemId: entry.item.id })}
                    onClick={() => onOpenItem && onOpenItem(entry.groupId, entry.item.id)}
                    title={`${entry.item.title}${entry.statusLabel ? ` (${entry.statusLabel})` : ''} — ลากไปวางวันอื่นเพื่อเปลี่ยนกำหนดส่ง`}
                    style={{
                      padding: '3px 6px',
                      borderRadius: '5px',
                      backgroundColor: entry.color,
                      color: '#ffffff',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.item.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
