import React, { useState } from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle, FiSearch, FiList, FiFilter, FiExternalLink } from 'react-icons/fi';
import StatusDropdown from './StatusDropdown';

const MyWorkView = ({ boards, onSelectBoard, onOpenItem, updateItem }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Collect all tasks across all grid boards
  const allTasks = [];
  boards.forEach(b => {
    if (b.type === 'grid' && b.groups) {
      b.groups.forEach(g => {
        (g.items || []).forEach(item => {
          allTasks.push({
            ...item,
            boardId: b.id,
            boardTitle: b.title,
            groupId: g.id,
            groupTitle: g.title,
            groupColor: g.color || '#579bfc'
          });
        });
      });
    }
  });

  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = !search.trim() || (task.title || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCount = allTasks.length;
  const doneCount = allTasks.filter(t => t.status === 'done').length;
  const workingCount = allTasks.filter(t => t.status === 'working').length;
  const stuckCount = allTasks.filter(t => t.status === 'stuck').length;

  const STATUS_OPTIONS = [
    { id: 'done', label: 'Done', color: '#00c875' },
    { id: 'working', label: 'Working on it', color: '#fdab3d' },
    { id: 'stuck', label: 'Stuck', color: '#e2445c' },
    { id: 'empty', label: '', color: '#c4c4c4' }
  ];

  return (
    <div style={{ padding: '2rem 3rem', color: 'var(--text-main)', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>📋 My Work</span>
          <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.08)', padding: '2px 10px', borderRadius: '12px' }}>
            {totalCount} งานทั้งหมด
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          รวบรวมงานทั้งหมดที่คุณและทีมกำลังรับผิดชอบจากทุกกระดาน (Cross-board overview)
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#20243f', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>งานทั้งหมด</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{totalCount}</div>
        </div>
        <div style={{ background: '#20243f', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#fdab3d', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <FiClock size={16} /> กำลังทำ (Working)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fdab3d' }}>{workingCount}</div>
        </div>
        <div style={{ background: '#20243f', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#00c875', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <FiCheckCircle size={16} /> เสร็จสมบูรณ์ (Done)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#00c875' }}>{doneCount}</div>
        </div>
        <div style={{ background: '#20243f', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#e2445c', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <FiAlertCircle size={16} /> ติดขัด (Stuck)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e2445c' }}>{stuckCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="ค้นหางานใน My work..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.25rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: '#20243f',
              color: 'var(--text-main)',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'working', 'done', 'stuck'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: filterStatus === st ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                background: filterStatus === st ? 'var(--accent-blue)' : '#20243f',
                color: '#fff',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: filterStatus === st ? 600 : 400
              }}
            >
              {st === 'all' ? 'ทั้งหมด' : st === 'working' ? 'กำลังทำ' : st === 'done' ? 'เสร็จสิ้น' : 'ติดขัด'}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Table */}
      <div style={{ background: '#20243f', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 50px', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', background: '#1c2038', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <div>ชื่องาน (Item)</div>
          <div>กระดาน / หมวดหมู่งาน</div>
          <div style={{ textAlign: 'center' }}>สถานะ (Status)</div>
          <div style={{ textAlign: 'center' }}>กำหนดส่ง (Due Date)</div>
          <div style={{ textAlign: 'center' }}>ผู้รับผิดชอบ</div>
          <div></div>
        </div>

        {filteredTasks.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            ไม่พบงานที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={`${task.boardId}-${task.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 50px',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                alignItems: 'center',
                fontSize: '0.9rem',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div 
                style={{ fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => onOpenItem && onOpenItem(task.groupId, task.id)}
                title="คลิกเพื่อดูรายละเอียดงาน"
              >
                <span>{task.title}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: task.groupColor }}></span>
                <span>{task.boardTitle} › {task.groupTitle}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StatusDropdown
                  statusId={task.status}
                  statusOptions={STATUS_OPTIONS}
                  onStatusChange={(newStatus) => updateItem && updateItem(task.groupId, task.id, 'status', newStatus)}
                />
              </div>

              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {task.date || '-'}
              </div>

              <div style={{ textAlign: 'center' }}>
                {task.owner ? (
                  <span style={{ background: '#579bfc', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>
                    {task.owner}
                  </span>
                ) : '-'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => onSelectBoard && onSelectBoard(task.boardId)}
                  title="ไปที่บอร์ดนี้"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <FiExternalLink size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyWorkView;
