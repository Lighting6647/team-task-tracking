import re

with open('src/components/TableView.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace the group header rendering to match monday exactly
# Instead of `<div className="group-header">`, we'll make a table row that spans columns or just a simple row above the table.
# Currently it is a `div` above the table. That is perfectly fine, we just need to style it right.
# In TableView:
# `<div className="group-header" style={{ color: group.color || 'var(--text-main)' }}>`
# we can change the chevron color.

new_group_section = """        <div key={group.id} className="group-section" style={{ marginBottom: '2rem' }}>
          <div className="group-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: group.color || 'var(--accent-blue)', position: 'relative' }}>
            <FiChevronDown size={18} style={{ cursor: 'pointer' }} />
            <div className="group-header-title">
              {editingGroupId === group.id ? (
                <input
                  type="text"
                  value={editGroupTitle}
                  onChange={(e) => setEditGroupTitle(e.target.value)}
                  onBlur={() => saveGroupTitle(group.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveGroupTitle(group.id); }}
                  autoFocus
                  className="inline-input"
                  style={{ color: group.color || 'var(--accent-blue)', fontSize: '1.25rem', fontWeight: 600 }}
                />
              ) : (
                <span onClick={() => { setEditingGroupId(group.id); setEditGroupTitle(group.title); }} style={{ fontSize: '1.25rem', fontWeight: 600, cursor: 'text' }}>
                  {group.title}
                </span>
              )}
            </div>
            <div className="group-header-actions">
              <button onClick={() => onDeleteGroup(board.id, group.id)} className="btn-outline" style={{ padding: '0.2rem 0.5rem', borderColor: 'transparent', marginBottom: 0 }}><FiTrash2 size={14} /></button>
            </div>
          </div>
          
          <table className="monday-table">
            <thead>
              <tr>
                <th style={{ width: '40px', padding: 0, textAlign: 'center' }}>
                  <div style={{ width: '14px', height: '14px', border: '1px solid var(--border-color)', borderRadius: '2px', margin: '0 auto' }}></div>
                </th>
                <th style={{ textAlign: 'left', paddingLeft: '1rem' }}>Item</th>
"""

# Replace the beginning of group mapping
code = re.sub(r'        <div key={group\.id} className="group-section">.*?<th style={{ textAlign: \'left\', paddingLeft: \'1rem\' }}>Item</th>', new_group_section, code, flags=re.DOTALL)


# Replace the `renderCell` logic for checkbox cell to just have a square border
new_checkbox_cell = """                  <td className="cell-checkbox">
                    <div className="group-color-indicator" style={{ backgroundColor: group.color || 'var(--accent-blue)' }}></div>
                    <div style={{ opacity: hoveredItemId === item.id ? 1 : 0, transition: 'opacity 0.2s', width: '14px', height: '14px', border: '1px solid var(--border-color)', borderRadius: '2px', margin: '0 auto', cursor: 'pointer' }}></div>
                  </td>"""
                  
code = re.sub(r'                  <td className="cell-checkbox">.*?</td>', new_checkbox_cell, code, flags=re.DOTALL)

with open('src/components/TableView.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
