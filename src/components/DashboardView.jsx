import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrash2, FiCpu, FiPlus, FiSettings, FiCheck } from 'react-icons/fi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#fdab3d', '#e2445c'];

const DashboardView = ({ board, allBoards, updateDashboard }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [editingWidgetId, setEditingWidgetId] = useState(null);

  const widgets = board.widgets || [];

  const handleAIGenerate = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const lower = aiPrompt.toLowerCase();
    
    // Determine Chart Type
    let chartType = 'bar';
    if (lower.includes('วงกลม') || lower.includes('pie')) chartType = 'pie';
    else if (lower.includes('เลข') || lower.includes('จำนวน') || lower.includes('number') || lower.includes('สรุป')) chartType = 'number';

    // Determine Source Board
    let targetBoard = allBoards.find(b => b.type === 'grid' && lower.includes(b.title.toLowerCase()));
    if (!targetBoard) {
      targetBoard = allBoards.find(b => b.type === 'grid');
    }
    if (!targetBoard) {
      alert("ไม่พบบอร์ดข้อมูลสำหรับสร้างกราฟ (Please create a grid board first)");
      return;
    }

    // Determine Grouping Column
    let groupByColId = 'status';
    if (lower.includes('คน') || lower.includes('person') || lower.includes('รับผิดชอบ') || lower.includes('ใคร')) {
      groupByColId = 'person';
    } else if (lower.includes('วัน') || lower.includes('date')) {
      groupByColId = 'date';
    }

    const titleMap = {
      'pie': 'Pie Chart',
      'bar': 'Bar Chart',
      'number': 'Number Summary'
    };

    const newWidget = {
      id: uuidv4(),
      type: chartType,
      title: `AI: ${titleMap[chartType]} of ${groupByColId} (${targetBoard.title})`,
      sourceBoardId: targetBoard.id,
      groupByColId
    };

    updateDashboard(board.id, [...widgets, newWidget]);
    setAiPrompt('');
  };

  const removeWidget = (id) => {
    updateDashboard(board.id, widgets.filter(w => w.id !== id));
    if (editingWidgetId === id) setEditingWidgetId(null);
  };

  const updateWidgetConfig = (id, field, value) => {
    updateDashboard(board.id, widgets.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const getWidgetData = (widget) => {
    const srcBoard = allBoards.find(b => b.id === widget.sourceBoardId);
    if (!srcBoard) return [];
    
    const items = srcBoard.groups.flatMap(g => g.items);
    const col = srcBoard.columns.find(c => c.id === widget.groupByColId);
    
    if (!col) return [];

    const counts = {};
    items.forEach(item => {
        let val = item[col.id];
        if (!val || val === 'empty') val = 'None';
        
        if (col.type === 'status' && col.options) {
            const opt = col.options.find(o => o.id === item[col.id]);
            if (opt) val = opt.label || 'Empty';
        }
        counts[val] = (counts[val] || 0) + 1;
    });

    return Object.keys(counts).map((key, index) => ({ 
      name: key, 
      count: counts[key],
      color: COLORS[index % COLORS.length]
    })).sort((a,b) => b.count - a.count);
  };

  const getTotalCount = (widget) => {
    const srcBoard = allBoards.find(b => b.id === widget.sourceBoardId);
    if (!srcBoard) return 0;
    return srcBoard.groups.flatMap(g => g.items).length;
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', overflow: 'auto' }}>
      
      {/* AI Prompt Bar */}
      <div style={{ 
        background: 'rgba(38, 40, 64, 0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '1.5rem', borderRadius: '12px', 
        border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' 
      }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)' }}>
          <FiCpu style={{ color: 'var(--accent-purple)' }} /> AI Widget Creator
        </h3>
        <form onSubmit={handleAIGenerate} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="เช่น 'สร้างกราฟวงกลมแสดงสถานะงานของบอร์ด MKT', 'ขอกราฟแท่งดูคนรับผิดชอบหน่อย'"
            style={{ 
              flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', 
              background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '1rem'
            }}
          />
          <button type="submit" style={{ 
            background: 'var(--accent-purple)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', 
            borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            ✨ Generate
          </button>
        </form>
      </div>

      {/* Widget Grid */}
      {widgets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
          <h2>Dashboard ว่างเปล่า</h2>
          <p>ลองพิมพ์คำสั่งให้ AI สร้างกราฟให้คุณดูสิ!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {widgets.map(widget => {
            const data = getWidgetData(widget);
            
            return (
              <div key={widget.id} style={{ 
                background: 'rgba(38, 40, 64, 0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: '12px', padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.12)', display: 'flex', flexDirection: 'column',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)', height: '350px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-color)' }}>{widget.title}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditingWidgetId(editingWidgetId === widget.id ? null : widget.id)} style={{ background: 'transparent', border: 'none', color: editingWidgetId === widget.id ? 'var(--accent-blue)' : 'var(--text-muted)', cursor: 'pointer' }}>
                      {editingWidgetId === widget.id ? <FiCheck size={16} /> : <FiSettings size={16} />}
                    </button>
                    <button onClick={() => removeWidget(widget.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
                  {editingWidgetId === widget.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', padding: '0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chart Type</label>
                        <select 
                          value={widget.type} 
                          onChange={(e) => updateWidgetConfig(widget.id, 'type', e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                        >
                          <option value="pie">Pie Chart</option>
                          <option value="bar">Bar Chart</option>
                          <option value="number">Number Summary</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Source Board</label>
                        <select 
                          value={widget.sourceBoardId} 
                          onChange={(e) => updateWidgetConfig(widget.id, 'sourceBoardId', e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                        >
                          {allBoards.filter(b => b.type === 'grid').map(b => (
                            <option key={b.id} value={b.id}>{b.title}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Group By (X-Axis)</label>
                        <select 
                          value={widget.groupByColId} 
                          onChange={(e) => updateWidgetConfig(widget.id, 'groupByColId', e.target.value)}
                          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                        >
                          {(allBoards.find(b => b.id === widget.sourceBoardId)?.columns || []).filter(c => !['link', 'timeline'].includes(c.type)).map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : widget.type === 'pie' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="count">
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(29, 30, 47, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.15)', color: 'var(--text-color)', borderRadius: '8px' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : widget.type === 'bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'rgba(29, 30, 47, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.15)', color: 'var(--text-color)', borderRadius: '8px' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : widget.type === 'number' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <div style={{ fontSize: '4.5rem', fontWeight: 'bold', color: 'var(--accent-blue)', lineHeight: 1 }}>
                        {getTotalCount(widget)}
                      </div>
                      <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Total Items
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardView;
