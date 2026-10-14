import re

with open('src/components/TableView.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

new_add_row = """              <tr className="add-item-row">
                <td style={{ borderLeft: '1px solid var(--border-color)', position: 'relative' }}>
                  <div className="group-color-indicator" style={{ backgroundColor: group.color || 'var(--accent-blue)' }}></div>
                </td>
                <td style={{ paddingLeft: '1rem' }}>
                  <input 
                    type="text" 
                    placeholder="+ Add Item" 
                    className="add-item-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        onAddItem(board.id, group.id, e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                </td>
"""

code = re.sub(r'              <tr className="add-item-row">.*?</td>\n                <td style={{ paddingLeft: \'1rem\' }}>', new_add_row, code, flags=re.DOTALL)

with open('src/components/TableView.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
